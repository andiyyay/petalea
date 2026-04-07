<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\OrderStateMachine;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    protected OrderStateMachine $stateMachine;

    public function __construct()
    {
        $this->stateMachine = new OrderStateMachine();
    }

    /**
     * Get all orders milik user yang sedang login
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with('items.product')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Get detail order tertentu milik user
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $order = $request->user()
            ->orders()
            ->with('items.product')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Get active orders (orders yang belum selesai/dibatalkan)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getActiveOrders(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with('items.product')
            ->active()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Create new order
     * Note: Untuk production, sebaiknya gunakan PaymentController::createPayment
     * yang sudah mengintegrasikan pembayaran Xendit
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string',
            'phone' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $items = $request->input('items');
        $totalAmount = 0;

        foreach ($items as $item) {
            $product = Product::findOrFail($item['product_id']);
            $totalAmount += $product->price * $item['quantity'];
        }

        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id' => $request->user()->id,
                'order_number' => Order::generateOrderNumber(),
                'status' => OrderStateMachine::STATE_WAITING_PAYMENT,
                'total_amount' => $totalAmount,
                'shipping_address' => $request->shipping_address,
                'phone' => $request->phone,
                'notes' => $request->notes,
            ]);

            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $subtotal = $product->price * $item['quantity'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'subtotal' => $subtotal,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'data' => $order->load('items.product'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create order', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to place order',
            ], 500);
        }
    }

    /**
     * User cancel order (hanya bisa dari WAITING_PAYMENT)
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        // Cari order milik user
        $order = $user->orders()->findOrFail($id);

        // Cek apakah user bisa membatalkan order ini
        if (!$order->canBeCancelledByUser()) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak dapat dibatalkan. ' .
                    'Hanya order dengan status "Menunggu Pembayaran" yang bisa dibatalkan.',
                'current_status' => $order->status,
                'current_status_label' => $order->status_label,
            ], 422);
        }

        return $this->cancelOrder($order, 'user', $request->input('reason', 'Dibatalkan oleh user'));
    }

    /**
     * Admin: Update status order (legacy method untuk backward compatibility)
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:WAITING_PAYMENT,WAITING_PROCESSING,PROCESSED,READY_FOR_PICKUP,COMPLETED,CANCELLED',
            'reason' => 'nullable|string|max:500',
        ]);

        $order = Order::with('items.product')->findOrFail($id);

        $targetStatus = $request->status;

        // Jika target adalah CANCELLED, gunakan method cancelOrder
        if ($targetStatus === OrderStateMachine::STATE_CANCELLED) {
            return $this->cancelOrder($order, 'admin', $request->input('reason', 'Dibatalkan oleh admin'));
        }

        // Validasi transisi state
        if (!$this->stateMachine->canTransition($order->status, $targetStatus)) {
            return response()->json([
                'success' => false,
                'message' => $this->stateMachine->getTransitionErrorMessage($order->status, $targetStatus),
                'current_status' => $order->status,
                'current_status_label' => $order->status_label,
                'target_status' => $targetStatus,
            ], 422);
        }

        // Lakukan transisi sesuai target state
        return match ($targetStatus) {
            OrderStateMachine::STATE_PROCESSED => $this->transitionToProcessed($order, $request->user()->id),
            OrderStateMachine::STATE_READY_FOR_PICKUP => $this->transitionToReadyForPickup($order, $request->user()->id),
            OrderStateMachine::STATE_COMPLETED => $this->transitionToCompleted($order, $request->user()->id),
            default => response()->json([
                'success' => false,
                'message' => 'Invalid transition',
            ], 422),
        };
    }

    /**
     * Admin: Move order to PROCESSED (WAITING_PROCESSING -> PROCESSED)
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function process(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $adminId = $request->user()->id;

        return $this->transitionToProcessed($order, $adminId);
    }

    /**
     * Admin: Move order to READY_FOR_PICKUP (PROCESSED -> READY_FOR_PICKUP)
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function markReady(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $adminId = $request->user()->id;

        return $this->transitionToReadyForPickup($order, $adminId);
    }

    /**
     * Admin: Move order to COMPLETED (READY_FOR_PICKUP -> COMPLETED)
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $adminId = $request->user()->id;

        return $this->transitionToCompleted($order, $adminId);
    }

    /**
     * Admin: Cancel order dengan alasan
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function adminCancel(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $order = Order::findOrFail($id);
        $adminId = $request->user()->id;

        // Cek apakah admin bisa membatalkan
        if (!$order->canBeCancelledByAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak dapat dibatalkan. Order sudah dalam state final.',
                'current_status' => $order->status,
                'current_status_label' => $order->status_label,
            ], 422);
        }

        return $this->cancelOrder($order, 'admin', $request->input('reason'));
    }

    /**
     * Transition: WAITING_PROCESSING -> PROCESSED
     * Order sedang diproses/disiapkan
     *
     * @param Order $order
     * @param int $adminId
     * @return JsonResponse
     */
    protected function transitionToProcessed(Order $order, int $adminId): JsonResponse
    {
        // Validasi state saat ini
        if ($order->status !== OrderStateMachine::STATE_WAITING_PROCESSING) {
            return response()->json([
                'success' => false,
                'message' => $this->stateMachine->getTransitionErrorMessage(
                    $order->status,
                    OrderStateMachine::STATE_PROCESSED
                ),
                'current_status' => $order->status,
                'current_status_label' => $order->status_label,
            ], 422);
        }

        DB::beginTransaction();
        try {
            $order->update([
                'status' => OrderStateMachine::STATE_PROCESSED,
                'processed_at' => now(),
            ]);

            // Log state transition
            Log::info('Order status updated', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'from_status' => OrderStateMachine::STATE_WAITING_PROCESSING,
                'to_status' => OrderStateMachine::STATE_PROCESSED,
                'admin_id' => $adminId,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order sedang diproses',
                'data' => $order->load('items.product'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to transition order to PROCESSED', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate status order',
            ], 500);
        }
    }

    /**
     * Transition: PROCESSED -> READY_FOR_PICKUP
     * Order siap diambil oleh customer
     *
     * @param Order $order
     * @param int $adminId
     * @return JsonResponse
     */
    protected function transitionToReadyForPickup(Order $order, int $adminId): JsonResponse
    {
        // Validasi state saat ini
        if ($order->status !== OrderStateMachine::STATE_PROCESSED) {
            return response()->json([
                'success' => false,
                'message' => $this->stateMachine->getTransitionErrorMessage(
                    $order->status,
                    OrderStateMachine::STATE_READY_FOR_PICKUP
                ),
                'current_status' => $order->status,
                'current_status_label' => $order->status_label,
            ], 422);
        }

        DB::beginTransaction();
        try {
            $order->update([
                'status' => OrderStateMachine::STATE_READY_FOR_PICKUP,
                'ready_for_pickup_at' => now(),
            ]);

            // Log state transition
            Log::info('Order status updated', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'from_status' => OrderStateMachine::STATE_PROCESSED,
                'to_status' => OrderStateMachine::STATE_READY_FOR_PICKUP,
                'admin_id' => $adminId,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order siap diambil',
                'data' => $order->load('items.product'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to transition order to READY_FOR_PICKUP', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate status order',
            ], 500);
        }
    }

    /**
     * Transition: READY_FOR_PICKUP -> COMPLETED
     * Order telah selesai (sudah diambil customer)
     *
     * @param Order $order
     * @param int $adminId
     * @return JsonResponse
     */
    protected function transitionToCompleted(Order $order, int $adminId): JsonResponse
    {
        // Validasi state saat ini
        if ($order->status !== OrderStateMachine::STATE_READY_FOR_PICKUP) {
            return response()->json([
                'success' => false,
                'message' => $this->stateMachine->getTransitionErrorMessage(
                    $order->status,
                    OrderStateMachine::STATE_COMPLETED
                ),
                'current_status' => $order->status,
                'current_status_label' => $order->status_label,
            ], 422);
        }

        DB::beginTransaction();
        try {
            $order->update([
                'status' => OrderStateMachine::STATE_COMPLETED,
            ]);

            // Log state transition
            Log::info('Order status updated', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'from_status' => OrderStateMachine::STATE_READY_FOR_PICKUP,
                'to_status' => OrderStateMachine::STATE_COMPLETED,
                'admin_id' => $adminId,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order telah selesai',
                'data' => $order->load('items.product'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to transition order to COMPLETED', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate status order',
            ], 500);
        }
    }

    /**
     * Cancel order dengan validasi state
     *
     * @param Order $order
     * @param string $cancelledBy ('user', 'admin', 'system')
     * @param string $reason
     * @return JsonResponse
     */
    protected function cancelOrder(Order $order, string $cancelledBy, string $reason): JsonResponse
    {
        // Validasi cancelled_by value
        if (!in_array($cancelledBy, ['user', 'admin', 'system'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid cancelled_by value',
            ], 422);
        }

        // Validasi state untuk user vs admin
        if ($cancelledBy === 'user' && !$order->canBeCancelledByUser()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat membatalkan order ini. ' .
                    'Hanya order dengan status "Menunggu Pembayaran" yang bisa dibatalkan.',
                'current_status' => $order->status,
                'current_status_label' => $order->status_label,
            ], 403);
        }

        if ($cancelledBy === 'admin' && !$order->canBeCancelledByAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak dapat dibatalkan. Order sudah dalam state final.',
                'current_status' => $order->status,
                'current_status_label' => $order->status_label,
            ], 422);
        }

        DB::beginTransaction();
        try {
            $order->update([
                'status' => OrderStateMachine::STATE_CANCELLED,
                'cancelled_by' => $cancelledBy,
                'cancelled_reason' => $reason,
            ]);

            // Restore product stock for cancelled orders
            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if ($product && $product->stock !== null) {
                    $product->increment('stock', $item->quantity);
                }
            }

            // Log state transition
            Log::info('Order cancelled', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'from_status' => $order->getOriginal('status'),
                'cancelled_by' => $cancelledBy,
                'reason' => $reason,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order berhasil dibatalkan',
                'data' => $order->load('items.product'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to cancel order', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membatalkan order',
            ], 500);
        }
    }

    /**
     * Get all orders (Admin only)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getAllOrders(Request $request): JsonResponse
    {
        $query = Order::with(['items.product', 'user']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by date range if provided
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->input('from_date'));
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->input('to_date'));
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }
}
