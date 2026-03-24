<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Webhook Request Validation
 *
 * Validasi incoming webhook dari Xendit
 * Memastikan payload memiliki data yang diperlukan
 */
class WebhookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Webhook sudah diverifikasi via XenditWebhookSignature middleware
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // External ID untuk identify order (format: INV-ORD-XXX)
            'external_id' => 'required|string',

            // Status pembayaran dari Xendit
            'status' => 'required|string|in:PENDING,PAID,SETTLED,EXPIRED,FAILED',

            // Invoice ID dari Xendit
            'id' => 'sometimes|string',

            // Nomor invoice
            'invoice_url' => 'sometimes|url',

            // Payment method yang digunakan
            'payment_method' => 'sometimes|string',

            // Payment channel detail (contoh: BCA, MANDIRI, GOPAY)
            'payment_channel' => 'sometimes|string',

            // Currency (default: IDR)
            'currency' => 'sometimes|string',

            // Amount yang dibayar
            'amount' => 'sometimes|numeric',

            // Paid timestamp
            'paid_at' => 'sometimes|date',

            // Payment detail object
            'payment_details' => 'sometimes|array',

            // Metadata yang dikirim saat create invoice
            'metadata' => 'sometimes|array',
        ];
    }

    /**
     * Get custom error messages in Indonesian
     */
    public function messages(): array
    {
        return [
            'external_id.required' => 'External ID wajib diisi',
            'status.required' => 'Status pembayaran wajib diisi',
            'status.in' => 'Status pembayaran tidak valid',
        ];
    }

    /**
     * Extract order number dari external_id
     * Format: INV-ORD-XXXXX -> ORD-XXXXX
     */
    public function getOrderNumber(): string
    {
        $externalId = $this->input('external_id');
        return str_replace('INV-', '', $externalId);
    }

    /**
     * Cek apakah status pembayaran adalah success
     */
    public function isPaymentSuccessful(): bool
    {
        $status = strtoupper($this->input('status'));
        return in_array($status, ['PAID', 'SETTLED']);
    }

    /**
     * Cek apakah pembayaran expired
     */
    public function isPaymentExpired(): bool
    {
        return strtoupper($this->input('status')) === 'EXPIRED';
    }

    /**
     * Cek apakah pembayaran failed
     */
    public function isPaymentFailed(): bool
    {
        return strtoupper($this->input('status')) === 'FAILED';
    }

    /**
     * Generate idempotency key dari webhook payload
     * Menggunakan invoice ID + status sebagai key unik untuk deduplication yang reliable
     * Ini lebih reliable daripada hash seluruh payload yang bisa berubah (e.g., timestamp)
     */
    public function getIdempotencyKey(): string
    {
        return sprintf(
            '%s:%s',
            $this->input('id', ''),
            $this->input('status', '')
        );
    }
}
