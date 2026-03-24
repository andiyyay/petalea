<?php

namespace App\Http\Controllers;

use App\Http\Requests\WebhookRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\OrderStateMachine;
use App\Services\XenditService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class PaymentController extends Controller
{
    protected XenditService $xenditService;
    protected OrderStateMachine $stateMachine;

    public function __construct(XenditService $xenditService)
    {
        $this->xenditService = $xenditService;
        $this->stateMachine = new OrderStateMachine();
    }

    /**
     * Create order and payment invoice in one request
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function createPayment(Request $request): JsonResponse
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string',
            'customer_info.full_name' => 'required|string',
            'customer_info.phone' => 'required|string',
            'customer_info.notes' => 'nullable|string',
        ]);

        $user = $request->user();

        DB::beginTransaction();
        try {
            // Calculate total amount
            $totalAmount = 0;
            $items = [];

            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $subtotal = $product->price * $item['quantity'];
                $totalAmount += $subtotal;

                $items[] = [
                    'product_id' => $item['product_id'],
                    'name' => $product->name,  // Always use DB value
                    'price' => $product->price,  // Always use DB price - prevents price manipulation
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal,
                ];
            }

            // Create order dengan initial state: WAITING_PAYMENT
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => Order::generateOrderNumber(),
                'status' => OrderStateMachine::STATE_WAITING_PAYMENT,
                'total_amount' => $totalAmount,
                'shipping_address' => 'SELF_PICKUP',
                'phone' => $request->customer_info['phone'],
                'notes' => $request->customer_info['notes'] ?? null,
                'shipping_cost' => 0,
            ]);

            // Create order items
            foreach ($items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['subtotal'],
                ]);
            }

            // Create invoice with Xendit
            $invoiceData = $this->xenditService->createInvoice(
                $order,
                $request->payment_method,
                $user->email,
                $request->customer_info['full_name']
            );

            // Update order dengan payment details
            $order->update([
                'payment_id' => $invoiceData['invoice_id'],
                'payment_url' => $invoiceData['payment_url'],
                'payment_method' => $invoiceData['payment_method'],
                'payment_status' => $this->mapXenditStatusToOrderStatus($invoiceData['status']),
                'expiry_time' => $invoiceData['expiry_date'],
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment invoice created successfully',
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'payment_url' => $invoiceData['payment_url'],
                    'payment_id' => $invoiceData['invoice_id'],
                    'amount' => $invoiceData['amount'],
                    'payment_method' => $invoiceData['payment_method'],
                    'expiry_time' => $invoiceData['expiry_date'],
                ],
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to create payment invoice', [
                'user_id' => $user->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment invoice',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Check payment status untuk sebuah order
     *
     * @param Request $request
     * @param string $id Order ID atau Payment ID
     * @return JsonResponse
     */
    public function getPaymentStatus(Request $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();

            // Find order by ID atau payment_id
            $order = Order::where(function ($query) use ($id) {
                $query->where('id', $id)->orWhere('payment_id', $id);
            })
                ->where('user_id', $user->id)
                ->firstOrFail();

            if (!$order->payment_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No payment found for this order',
                ], 404);
            }

            // Get latest status dari Xendit
            $invoiceStatus = $this->xenditService->getInvoiceStatus($order->payment_id);

            // Update order status jika berubah
            $newPaymentStatus = $invoiceStatus['status'];
            if ($order->payment_status !== $newPaymentStatus) {
                $this->updateOrderPaymentStatus($order, $invoiceStatus);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'order_status' => $order->status,
                    'order_status_label' => $order->status_label,
                    'payment_id' => $order->payment_id,
                    'payment_status' => $order->payment_status,
                    'payment_method' => $order->payment_method,
                    'amount' => $order->total_amount,
                    'paid_at' => $order->paid_at,
                    'expiry_time' => $order->expiry_time,
                    'xendit_status' => $invoiceStatus,
                ],
            ]);
        } catch (Exception $e) {
            Log::error('Failed to get payment status', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve payment status',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Handle Xendit webhook callbacks dengan idempotency
     *
     * Webhook handler ini mendukung:
     * - Idempotency key untuk mencegah double processing
     * - State machine transitions yang valid
     * - Locking untuk mencegah race conditions
     *
     * @param WebhookRequest $request
     * @return JsonResponse
     */
    public function handleWebhook(WebhookRequest $request): JsonResponse
    {
        try {
            $payload = $request->all();

            Log::info('Xendit webhook received', [
                'external_id' => $payload['external_id'] ?? null,
                'status' => $payload['status'] ?? null,
                'amount' => $payload['amount'] ?? null,
                'payment_method' => $payload['payment_method'] ?? null,
                'full_payload' => $payload,
            ]);

            // Extract order number dari external_id (format: INV-ORD-XXX)
            $orderNumber = $request->getOrderNumber();

            // Generate idempotency key dari webhook payload
            $idempotencyKey = $request->getIdempotencyKey();

            // Cari order dan gunakan locking untuk mencegah race condition
            $order = Order::where('order_number', $orderNumber)
                ->lockForUpdate()
                ->first();

            if (!$order) {
                Log::warning('Order not found for webhook', [
                    'external_id' => $payload['external_id'],
                    'order_number' => $orderNumber,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Order not found',
                ], 404);
            }

            // Cek idempotency - jika webhook ini sudah diproses, return success
            if ($order->idempotency_key === $idempotencyKey) {
                Log::info('Webhook already processed, skipping', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'idempotency_key' => $idempotencyKey,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Webhook already processed',
                    'data' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'status' => $order->status,
                    ],
                ], 200);
            }

            // Tentukan status baru berdasarkan payment status dari Xendit
            $xenditStatus = strtoupper($payload['status']);
            $orderStatus = $this->mapXenditStatusToOrderStatus($xenditStatus);

            DB::beginTransaction();
            try {
                $updateData = [
                    'payment_status' => $orderStatus,
                    'idempotency_key' => $idempotencyKey,
                ];

                // Handle payment success: WAITING_PAYMENT -> WAITING_PROCESSING
                if ($request->isPaymentSuccessful()) {
                    // Validate payment amount matches order total
                    $paidAmount = $payload['amount'] ?? 0;
                    if (abs($paidAmount - $order->total_amount) > 0.01) {
                        Log::warning('Payment amount mismatch in webhook', [
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'expected_amount' => $order->total_amount,
                            'paid_amount' => $paidAmount,
                        ]);
                        
                        return response()->json([
                            'success' => false,
                            'message' => 'Payment amount mismatch',
                        ], 400);
                    }
                    
                    // Validasi transisi state
                    if (!$this->stateMachine->canTransition($order->status, OrderStateMachine::STATE_WAITING_PROCESSING)) {
                        Log::warning('Invalid state transition for payment success', [
                            'order_id' => $order->id,
                            'current_status' => $order->status,
                            'target_status' => OrderStateMachine::STATE_WAITING_PROCESSING,
                        ]);
                        // Tetap lanjutkan tapi jangan update status order
                    } else {
                        $updateData['status'] = OrderStateMachine::STATE_WAITING_PROCESSING;
                        $updateData['paid_at'] = now();

                        // Log payment details
                        if (isset($payload['payment_method'])) {
                            $updateData['payment_method'] = $payload['payment_method'];
                        }

                        Log::info('Order status updated: WAITING_PAYMENT -> WAITING_PROCESSING', [
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                        ]);
                    }
                }
                // Handle payment expired/failed: WAITING_PAYMENT -> CANCELLED
                elseif ($request->isPaymentExpired() || $request->isPaymentFailed()) {
                    $reason = $request->isPaymentExpired() ? 'Pembayaran kadaluarsa' : 'Pembayaran gagal';

                    // Validasi transisi state
                    if (!$this->stateMachine->canTransition($order->status, OrderStateMachine::STATE_CANCELLED)) {
                        Log::warning('Invalid state transition for payment expired/failed', [
                            'order_id' => $order->id,
                            'current_status' => $order->status,
                        ]);
                    } else {
                        $updateData['status'] = OrderStateMachine::STATE_CANCELLED;
                        $updateData['cancelled_by'] = 'system';
                        $updateData['cancelled_reason'] = $reason;

                        Log::info('Order status updated: WAITING_PAYMENT -> CANCELLED (payment expired/failed)', [
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'reason' => $reason,
                        ]);
                    }
                }

                $order->update($updateData);

                DB::commit();

                Log::info('Order updated successfully via webhook', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'payment_status' => $orderStatus,
                    'order_status' => $order->status,
                    'idempotency_key' => $idempotencyKey,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Webhook processed successfully',
                    'data' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'status' => $order->status,
                    ],
                ]);
            } catch (Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            Log::error('Failed to process webhook', [
                'error' => $e->getMessage(),
                'payload' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process webhook',
            ], 500);
        }
    }

    /**
     * Get available payment methods
     *
     * @return JsonResponse
     */
    public function getPaymentMethods(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => XenditService::getSupportedPaymentMethods(),
        ]);
    }

    /**
     * Update order payment status dari Xendit invoice data
     */
    protected function updateOrderPaymentStatus(Order $order, array $invoiceStatus): void
    {
        $paymentStatus = $invoiceStatus['status'];

        DB::beginTransaction();
        try {
            $updateData = [
                'payment_status' => $paymentStatus,
            ];

            if (in_array($paymentStatus, ['PAID', 'SETTLED'])) {
                // Validasi transisi state
                if ($this->stateMachine->canTransition($order->status, OrderStateMachine::STATE_WAITING_PROCESSING)) {
                    $updateData['status'] = OrderStateMachine::STATE_WAITING_PROCESSING;
                    $updateData['paid_at'] = now();
                }

                if (!empty($invoiceStatus['payment_method'])) {
                    $updateData['payment_method'] = $invoiceStatus['payment_method'];
                }
            } elseif ($paymentStatus === 'EXPIRED' || $paymentStatus === 'FAILED') {
                $reason = $paymentStatus === 'EXPIRED' ? 'Pembayaran kadaluarsa' : 'Pembayaran gagal';

                if ($this->stateMachine->canTransition($order->status, OrderStateMachine::STATE_CANCELLED)) {
                    $updateData['status'] = OrderStateMachine::STATE_CANCELLED;
                    $updateData['cancelled_by'] = 'system';
                    $updateData['cancelled_reason'] = $reason;
                }
            }

            $order->update($updateData);

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to update order payment status', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Map Xendit status ke order payment status
     */
    protected function mapXenditStatusToOrderStatus(string $xenditStatus): string
    {
        return match (strtoupper($xenditStatus)) {
            'PENDING' => 'PENDING',
            'PAID', 'SETTLED' => 'PAID',
            'EXPIRED' => 'EXPIRED',
            'FAILED' => 'FAILED',
            default => 'PENDING',
        };
    }
}
