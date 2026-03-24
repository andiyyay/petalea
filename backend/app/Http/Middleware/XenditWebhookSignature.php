<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class XenditWebhookSignature
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $webhookToken = config('services.xendit.webhook_token') ?? env('XENDIT_WEBHOOK_TOKEN');

        // Check if webhook token is configured
        if (empty($webhookToken)) {
            Log::error('Xendit webhook token is not configured');

            return response()->json([
                'success' => false,
                'message' => 'Webhook configuration error',
            ], 500);
        }

        // Get the webhook token from request headers
        $xenditToken = $request->header('X-Callback-Token');

        if (empty($xenditToken)) {
            Log::warning('Xendit webhook received without callback token');

            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Missing callback token',
            ], 401);
        }

        // Verify the webhook token
        if (!hash_equals($webhookToken, $xenditToken)) {
            Log::warning('Xendit webhook received with invalid token', [
                'received' => $xenditToken,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Invalid token',
            ], 401);
        }

        // Store verified webhook data for logging
        $request->attributes->set('xendit_webhook_verified', true);

        return $next($request);
    }
}
