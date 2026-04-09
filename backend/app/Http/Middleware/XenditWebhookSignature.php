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
        $webhookToken = trim((string) (config('services.xendit.webhook_token') ?? env('XENDIT_WEBHOOK_TOKEN') ?? ''));

        // Check if webhook token is configured
        if (empty($webhookToken)) {
            Log::error('Xendit webhook token is not configured');

            return response()->json([
                'success' => false,
                'message' => 'Webhook configuration error',
            ], 500);
        }

        // Read the callback token from common header sources to avoid server-specific casing issues.
        $xenditToken = trim((string) (
            $request->header('X-Callback-Token')
            ?? $request->header('x-callback-token')
            ?? $request->server('HTTP_X_CALLBACK_TOKEN')
            ?? ''
        ));

        if (empty($xenditToken)) {
            Log::warning('Xendit webhook received without callback token', [
                'header_names' => array_keys($request->headers->all()),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Missing callback token',
            ], 401);
        }

        // Verify the webhook token
        if (!hash_equals($webhookToken, $xenditToken)) {
            Log::warning('Xendit webhook received with invalid token', [
                'received_token_length' => strlen($xenditToken),
                'expected_token_length' => strlen($webhookToken),
                'has_whitespace_issue' => $xenditToken !== (string) (
                    $request->header('X-Callback-Token')
                    ?? $request->header('x-callback-token')
                    ?? $request->server('HTTP_X_CALLBACK_TOKEN')
                    ?? ''
                ),
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
