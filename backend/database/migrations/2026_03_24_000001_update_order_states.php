<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Update orders table with new state machine columns
     * - Ubah status enum ke state machine baru
     * - Tambah idempotency_key untuk webhook deduplication
     * - Tambah kolom pembatalan (cancelled_by, cancelled_reason)
     * - Tambah timestamp untuk state tracking (processed_at, ready_for_pickup_at)
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Drop old status enum and create new one with state machine states
            // Note: MySQL doesn't support modifying enum directly, so we need to drop and recreate
            $table->dropColumn('status');
        });

        Schema::table('orders', function (Blueprint $table) {
            // State machine status enum - sesuai urutan flow order
            $table->enum('status', [
                'WAITING_PAYMENT',      // Order baru, menunggu pembayaran
                'WAITING_PROCESSING',   // Pembayaran sukses, menunggu admin proses
                'PROCESSED',            // Sedang disiapkan
                'READY_FOR_PICKUP',     // Siap diambil
                'COMPLETED',            // Selesai
                'CANCELLED',            // Dibatalkan
            ])->default('WAITING_PAYMENT')->after('order_number');

            // Idempotency key untuk webhook deduplication
            // Mencegah double processing dari Xendit webhook
            $table->string('idempotency_key')->nullable()->unique()->after('status');

            // Kolom pembatalan - tracking siapa yang batalkan dan alasan
            $table->enum('cancelled_by', ['user', 'system', 'admin'])->nullable()->after('idempotency_key');
            $table->text('cancelled_reason')->nullable()->after('cancelled_by');

            // Timestamps untuk state transitions
            $table->timestamp('processed_at')->nullable()->after('paid_at');
            $table->timestamp('ready_for_pickup_at')->nullable()->after('processed_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'idempotency_key',
                'cancelled_by',
                'cancelled_reason',
                'processed_at',
                'ready_for_pickup_at',
                'status',
            ]);
        });

        Schema::table('orders', function (Blueprint $table) {
            // Restore original status enum (using new uppercase format for consistency)
            $table->enum('status', ['WAITING_PAYMENT', 'WAITING_PROCESSING', 'PROCESSED', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'])
                ->default('WAITING_PAYMENT')
                ->after('order_number');
        });
    }
};
