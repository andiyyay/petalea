<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_id')->nullable()->after('delivered_at')->comment('Xendit invoice ID');
            $table->string('payment_url')->nullable()->after('payment_id')->comment('Payment page URL');
            $table->string('payment_method')->nullable()->after('payment_url')->comment('Payment method chosen');
            $table->string('payment_status')->nullable()->after('payment_method')->comment('Xendit payment status');
            $table->timestamp('paid_at')->nullable()->after('payment_status')->comment('When payment was completed');
            $table->decimal('shipping_cost', 10, 2)->nullable()->after('paid_at')->comment('Shipping cost amount');
            $table->timestamp('expiry_time')->nullable()->after('shipping_cost')->comment('Payment expiry time');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_id',
                'payment_url',
                'payment_method',
                'payment_status',
                'paid_at',
                'shipping_cost',
                'expiry_time',
            ]);
        });
    }
};
