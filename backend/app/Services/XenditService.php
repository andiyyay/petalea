<?php

namespace App\Services;

use Xendit\Configuration;
use Xendit\Invoice\InvoiceApi;
use Xendit\Invoice\CreateInvoiceRequest;
use Xendit\XenditSdkException;
use Exception;

class XenditService
{
    protected string $secretKey;
    protected string $successRedirectUrl;
    protected string $failureRedirectUrl;
    protected InvoiceApi $invoiceApi;

    /**
     * Supported payment methods by Xendit
     */
    public const PAYMENT_METHODS = [
        'VIRTUAL_ACCOUNT' => 'Virtual Account',
        'EWALLET' => 'E-Wallet',
        'QRIS' => 'QRIS',
        'CREDIT_CARD' => 'Credit Card',
        'RETAIL_OUTLET' => 'Retail Outlet',
    ];

    /**
     * Map frontend method IDs directly to Xendit payment method codes.
     * Xendit Invoice API requires specific channel codes, not category names.
     */
    public const METHOD_MAP = [
        // QRIS
        'qris' => 'QRIS',

        // Virtual Accounts
        'bca_va' => 'BANK_TRANSFER',
        'mandiri_va' => 'MANDIRI',
        'bni_va' => 'BNI',
        'bri_va' => 'BRI',
        'permata_va' => 'PERMATA',

        // E-Wallets (specific channel codes required by Xendit)
        'ovo' => 'OVO',
        'dana' => 'DANA',
        'shopeepay' => 'SHOPEEPAY',
        'linkaja' => 'LINKAJA',

        // Credit Card
        'credit_card' => 'CREDIT_CARD',

        // Retail Outlets (specific channel codes required by Xendit)
        'alfamart' => 'ALFAMART',
        'indomaret' => 'INDOMARET',
    ];

    /**
     * Payment status mapping from Xendit to application
     */
    public const PAYMENT_STATUS_MAP = [
        'PENDING' => 'PENDING',
        'PAID' => 'PAID',
        'EXPIRED' => 'EXPIRED',
        'FAILED' => 'FAILED',
        'SETTLED' => 'PAID',
    ];

    public function __construct()
    {
        $this->secretKey = config('services.xendit.secret_key');
        $this->successRedirectUrl = config('services.xendit.success_redirect_url');
        $this->failureRedirectUrl = config('services.xendit.failure_redirect_url');

        Configuration::setXenditKey($this->secretKey);

        $this->invoiceApi = new InvoiceApi();
    }

    /**
     * Create a new Xendit Invoice
     *
     * @param mixed $order Order model or array with order details
     * @param string $paymentMethod Payment method chosen
     * @param string $userEmail Customer email
     * @param string $userName Customer name
     * @return array Invoice data with payment_url and invoice_id
     * @throws Exception
     */
    public function createInvoice($order, string $paymentMethod, string $userEmail, string $userName): array
    {
        try {
            $orderNumber = is_object($order) ? $order->order_number : ($order['order_number'] ?? 'ORD-UNKNOWN');
            $totalAmount = is_object($order) ? $order->total_amount : ($order['total_amount'] ?? 0);
            $orderId = is_object($order) ? $order->id : ($order['id'] ?? null);

            // Validate payment method
            if (!$this->isValidPaymentMethod($paymentMethod)) {
                throw new Exception("Invalid payment method: {$paymentMethod}");
            }

            $invoiceRequest = new CreateInvoiceRequest();
            $invoiceRequest->setExternalId("INV-{$orderNumber}");
            $invoiceRequest->setAmount((float) $totalAmount);
            $invoiceRequest->setInvoiceDuration(3600); // 1 hour in seconds
            $invoiceRequest->setDescription("Pembayaran untuk Pesanan #{$orderNumber} - Self Pick Up");
            $invoiceRequest->setCurrency('IDR');
            $invoiceRequest->setReminderTime(1);

            // Set customer details
            $customer = new \Xendit\Invoice\CustomerObject();
            $customer->setEmail($this->sanitizeEmail($userEmail));
            $customer->setGivenNames($this->extractGivenName($userName));
            $customer->setSurname($this->extractSurname($userName));
            $invoiceRequest->setCustomer($customer);

            $invoiceRequest->setSuccessRedirectUrl($this->successRedirectUrl);
            $invoiceRequest->setFailureRedirectUrl($this->failureRedirectUrl);

            // Set metadata
            $invoiceRequest->setMetadata([
                'order_id' => $orderId,
                'order_number' => $orderNumber,
                'payment_method' => $paymentMethod,
                'shipping_type' => 'SELF_PICKUP',
            ]);

            // Add payment method specific configuration
            if ($paymentMethod !== 'ALL') {
                $invoiceRequest->setPaymentMethods([$this->mapPaymentMethodToXendit($paymentMethod)]);
            }

            $invoice = $this->invoiceApi->createInvoice($invoiceRequest);

            return [
                'invoice_id' => $invoice->getId(),
                'external_id' => $invoice->getExternalId(),
                'payment_url' => $invoice->getInvoiceUrl(),
                'amount' => $invoice->getAmount(),
                'status' => $this->statusToString($invoice->getStatus()),
                'expiry_date' => $invoice->getExpiryDate() ? $invoice->getExpiryDate()->format('Y-m-d H:i:s') : null,
                'payment_method' => $paymentMethod,
            ];
        } catch (XenditSdkException $e) {
            throw new Exception("Xendit API Error: " . $e->getMessage());
        } catch (Exception $e) {
            throw new Exception("Failed to create invoice: " . $e->getMessage());
        }
    }

    /**
     * Get invoice status from Xendit
     *
     * @param string $invoiceId Xendit invoice ID
     * @return array Invoice status data
     * @throws Exception
     */
    public function getInvoiceStatus(string $invoiceId): array
    {
        try {
            $invoice = $this->invoiceApi->getInvoiceById($invoiceId);

            return [
                'invoice_id' => $invoice->getId(),
                'external_id' => $invoice->getExternalId(),
                'status' => $this->mapPaymentStatus($this->statusToString($invoice->getStatus())),
                'amount' => $invoice->getAmount(),
                'paid_amount' => null,
                'payment_method' => $invoice->getPaymentMethod() ? $this->paymentMethodToString($invoice->getPaymentMethod()) : null,
                'payment_channel' => null,
                'paid_at' => null,
                'expiry_date' => $invoice->getExpiryDate() ? $invoice->getExpiryDate()->format('Y-m-d H:i:s') : null,
                'merchant_name' => $invoice->getMerchantName(),
            ];
        } catch (XenditSdkException $e) {
            throw new Exception("Xendit API Error: " . $e->getMessage());
        } catch (Exception $e) {
            throw new Exception("Failed to retrieve invoice: " . $e->getMessage());
        }
    }

    /**
     * Validate if payment method is supported
     */
    public function isValidPaymentMethod(string $method): bool
    {
        $validMethods = array_keys(self::PAYMENT_METHODS);
        $validMethods = array_merge($validMethods, array_keys(self::METHOD_MAP));
        $validMethods[] = 'ALL'; // Support all payment methods

        return in_array(strtoupper($method), $validMethods) || isset(self::METHOD_MAP[$method]);
    }

    /**
     * Map application payment method to Xendit payment method code.
     * Returns the specific Xendit-accepted payment method string.
     */
    protected function mapPaymentMethodToXendit(string $method): string
    {
        // Direct mapping from METHOD_MAP (already contains Xendit-accepted values)
        if (isset(self::METHOD_MAP[$method])) {
            return self::METHOD_MAP[$method];
        }

        // Fallback: uppercase the method name
        return strtoupper($method);
    }

    /**
     * Map Xendit status to application status
     */
    protected function mapPaymentStatus(string $status): string
    {
        return self::PAYMENT_STATUS_MAP[strtoupper($status)] ?? strtoupper($status);
    }

    /**
     * Convert InvoiceStatus enum to string
     */
    protected function statusToString($status): string
    {
        if (is_object($status) && method_exists($status, 'value')) {
            return $status->value();
        }
        if (is_object($status) && method_exists($status, '__toString')) {
            return (string) $status;
        }
        return (string) $status;
    }

    /**
     * Convert InvoicePaymentMethod enum to string
     */
    protected function paymentMethodToString($method): string
    {
        if (is_object($method) && method_exists($method, 'value')) {
            return $method->value();
        }
        if (is_object($method) && method_exists($method, '__toString')) {
            return (string) $method;
        }
        return (string) $method;
    }

    /**
     * Extract given name from full name
     */
    protected function extractGivenName(string $fullName): string
    {
        $parts = explode(' ', trim($fullName));
        $name = $parts[0] ?? 'Customer';

        // Avoid common system names that Xendit might reject
        $invalidNames = ['Admin', 'Administrator', 'User', 'System', 'Test'];
        if (in_array($name, $invalidNames)) {
            return 'Customer';
        }

        return $name;
    }

    /**
     * Extract surname from full name
     */
    protected function extractSurname(string $fullName): string
    {
        $parts = explode(' ', trim($fullName));
        array_shift($parts);

        // Xendit requires non-empty surname
        if (empty($parts)) {
            return 'Customer';
        }

        return implode(' ', $parts);
    }

    /**
     * Validate and sanitize email for Xendit
     */
    protected function sanitizeEmail(string $email): string
    {
        // Xendit rejects emails with very short local parts (less than 2 chars)
        $localPart = explode('@', $email)[0] ?? '';

        if (strlen($localPart) < 2) {
            // Use a default email format
            return 'customer@petalea.com';
        }

        return $email;
    }

    /**
     * Get supported payment methods list
     */
    public static function getSupportedPaymentMethods(): array
    {
        return self::PAYMENT_METHODS;
    }
}
