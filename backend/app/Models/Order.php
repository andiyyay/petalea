<?php

namespace App\Models;

use App\Services\OrderStateMachine;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    /**
     * Kolom yang bisa di-fill secara mass assignment
     */
    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'total_amount',
        'shipping_address',
        'phone',
        'notes',
        'shipped_at',
        'delivered_at',
        'payment_id',
        'payment_url',
        'payment_method',
        'payment_status',
        'paid_at',
        'shipping_cost',
        'expiry_time',
        // State machine columns
        'idempotency_key',
        'cancelled_by',
        'cancelled_reason',
        'processed_at',
        'ready_for_pickup_at',
    ];

    /**
     * Type casting untuk kolom
     */
    protected $casts = [
        'total_amount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'paid_at' => 'datetime',
        'expiry_time' => 'datetime',
        'processed_at' => 'datetime',
        'ready_for_pickup_at' => 'datetime',
    ];

    /**
     * Relasi ke user yang membuat order
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke order items
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Relasi many-to-many ke products melalui order_items
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'order_items')
            ->withPivot('quantity', 'price', 'subtotal')
            ->withTimestamps();
    }

    /**
     * Generate order number unik
     */
    public static function generateOrderNumber()
    {
        return 'ORD-' . strtoupper(uniqid());
    }

    /**
     * Scope untuk mendapatkan order dengan status tertentu
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk mendapatkan active orders (bukan completed/cancelled)
     */
    public function scopeActive($query)
    {
        $stateMachine = new OrderStateMachine();
        return $query->whereIn('status', [
            OrderStateMachine::STATE_WAITING_PAYMENT,
            OrderStateMachine::STATE_WAITING_PROCESSING,
            OrderStateMachine::STATE_PROCESSED,
            OrderStateMachine::STATE_READY_FOR_PICKUP,
        ]);
    }

    /**
     * Cek apakah order bisa dibatalkan oleh user
     */
    public function canBeCancelledByUser(): bool
    {
        $stateMachine = new OrderStateMachine();
        return $stateMachine->canUserCancel($this->status);
    }

    /**
     * Cek apakah order bisa dibatalkan oleh admin
     */
    public function canBeCancelledByAdmin(): bool
    {
        $stateMachine = new OrderStateMachine();
        return $stateMachine->canAdminCancel($this->status);
    }

    /**
     * Cek apakah order sudah final state (completed/cancelled)
     */
    public function isFinalState(): bool
    {
        $stateMachine = new OrderStateMachine();
        return $stateMachine->isFinalState($this->status);
    }

    /**
     * Mendapatkan label status dalam Bahasa Indonesia
     */
    public function getStatusLabelAttribute(): string
    {
        return OrderStateMachine::getStateLabel($this->status);
    }

    /**
     * Cek apakah transisi state valid
     */
    public function canTransitionTo(string $newStatus): bool
    {
        $stateMachine = new OrderStateMachine();
        return $stateMachine->canTransition($this->status, $newStatus);
    }

    /**
     * Mendapatkan allowed transitions dari state saat ini
     */
    public function getAllowedTransitions(): array
    {
        $stateMachine = new OrderStateMachine();
        return $stateMachine->getAllowedTransitions($this->status);
    }
}
