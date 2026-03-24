<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/products', [ProductController::class, 'index']);

// Payment webhook - no authentication required, uses webhook signature middleware
Route::post('/payment/webhook', [PaymentController::class, 'handleWebhook'])
    ->middleware('xendit.webhook.signature');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn(Request $request) => $request->user());

    // Payment routes
    Route::prefix('payment')->group(function () {
        Route::get('/methods', [PaymentController::class, 'getPaymentMethods']);
        Route::post('/create', [PaymentController::class, 'createPayment']);
        Route::get('/{id}/status', [PaymentController::class, 'getPaymentStatus']);
    });

    // Order routes - user only
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/active', [OrderController::class, 'getActiveOrders']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::post('/', [OrderController::class, 'store']);
        Route::post('/{id}/cancel', [OrderController::class, 'cancel']);
    });

    // Admin routes - requires admin role
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Product management
        Route::prefix('products')->group(function () {
            Route::get('/', [ProductController::class, 'index']);
            Route::post('/', [ProductController::class, 'store']);
            Route::get('/{id}', [ProductController::class, 'show']);
            Route::put('/{id}', [ProductController::class, 'update']);
            Route::delete('/{id}', [ProductController::class, 'destroy']);
        });

        // Admin order management - state machine transitions
        Route::prefix('orders')->group(function () {
            // Get all orders with filters (status, date range, pagination)
            Route::get('/', [OrderController::class, 'getAllOrders']);

            // State transition routes untuk admin
            Route::put('/{id}/status', [OrderController::class, 'updateStatus']);
            Route::put('/{id}/process', [OrderController::class, 'process']);
            Route::put('/{id}/ready', [OrderController::class, 'markReady']);
            Route::put('/{id}/complete', [OrderController::class, 'complete']);
            Route::put('/{id}/cancel', [OrderController::class, 'adminCancel']);

            // View single order detail (admin can see any order)
            Route::get('/{id}', [OrderController::class, 'show']);
        });
    });
});
