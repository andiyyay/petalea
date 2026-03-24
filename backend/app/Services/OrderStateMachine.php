<?php

namespace App\Services;

/**
 * Order State Machine Service
 *
 * Mengelola transisi state order dengan aturan bisnis yang valid.
 * Setiap state memiliki transisi yang diperbolehkan untuk mencegah
 * perubahan status yang tidak valid.
 */
class OrderStateMachine
{
    // State Constants - Status order dalam sistem
    public const STATE_WAITING_PAYMENT = 'WAITING_PAYMENT';
    public const STATE_WAITING_PROCESSING = 'WAITING_PROCESSING';
    public const STATE_PROCESSED = 'PROCESSED';
    public const STATE_READY_FOR_PICKUP = 'READY_FOR_PICKUP';
    public const STATE_COMPLETED = 'COMPLETED';
    public const STATE_CANCELLED = 'CANCELLED';

    // Valid Transitions - Aturan transisi state yang diperbolehkan
    // Format: 'FROM_STATE' => ['TO_STATE_1', 'TO_STATE_2', ...]
    private const TRANSITIONS = [
        self::STATE_WAITING_PAYMENT => [
            self::STATE_CANCELLED,           // User cancel / payment expired
            self::STATE_WAITING_PROCESSING,  // Webhook success - automatic
        ],
        self::STATE_WAITING_PROCESSING => [
            self::STATE_PROCESSED,           // Admin action - mulai proses
            self::STATE_CANCELLED,           // Admin cancel dengan reason
        ],
        self::STATE_PROCESSED => [
            self::STATE_READY_FOR_PICKUP,    // Admin action - siap diambil
            self::STATE_CANCELLED,           // Admin cancel dengan reason
        ],
        self::STATE_READY_FOR_PICKUP => [
            self::STATE_COMPLETED,           // Admin action - selesai
            self::STATE_CANCELLED,           // Admin cancel dengan reason
        ],
        self::STATE_COMPLETED => [],        // Final state - tidak bisa transisi
        self::STATE_CANCELLED => [],        // Final state - tidak bisa transisi
    ];

    /**
     * Cek apakah transisi dari satu state ke state lain valid
     *
     * @param string $from State saat ini
     * @param string $to State tujuan
     * @return bool True jika transisi valid, false jika tidak
     */
    public function canTransition(string $from, string $to): bool
    {
        // Jika state sama, tidak perlu transisi
        if ($from === $to) {
            return false;
        }

        // Cek apakah state source valid
        if (!isset(self::TRANSITIONS[$from])) {
            return false;
        }

        // Cek apakah state tujuan ada dalam daftar transisi yang diperbolehkan
        return in_array($to, self::TRANSITIONS[$from]);
    }

    /**
     * Mendapatkan daftar state yang bisa dituju dari state tertentu
     *
     * @param string $state State saat ini
     * @return array Daftar state yang bisa dituju
     */
    public function getAllowedTransitions(string $state): array
    {
        return self::TRANSITIONS[$state] ?? [];
    }

    /**
     * Mendapatkan label human-readable untuk state
     * Digunakan untuk display di frontend
     *
     * @param string $state State constant
     * @return string Label dalam Bahasa Indonesia
     */
    public static function getStateLabel(string $state): string
    {
        return match ($state) {
            self::STATE_WAITING_PAYMENT => 'Menunggu Pembayaran',
            self::STATE_WAITING_PROCESSING => 'Menunggu Diproses',
            self::STATE_PROCESSED => 'Sedang Diproses',
            self::STATE_READY_FOR_PICKUP => 'Siap Diambil',
            self::STATE_COMPLETED => 'Selesai',
            self::STATE_CANCELLED => 'Dibatalkan',
            default => 'Unknown',
        };
    }

    /**
     * Cek apakah state adalah final state (tidak bisa transisi lagi)
     *
     * @param string $state State yang dicek
     * @return bool True jika final state
     */
    public function isFinalState(string $state): bool
    {
        return in_array($state, [
            self::STATE_COMPLETED,
            self::STATE_CANCELLED,
        ]);
    }

    /**
     * Cek apakah state adalah active state (masih dalam proses)
     *
     * @param string $state State yang dicek
     * @return bool True jika active state
     */
    public function isActiveState(string $state): bool
    {
        return in_array($state, [
            self::STATE_WAITING_PAYMENT,
            self::STATE_WAITING_PROCESSING,
            self::STATE_PROCESSED,
            self::STATE_READY_FOR_PICKUP,
        ]);
    }

    /**
     * Mendapatkan semua state constants
     *
     * @return array Semua state yang tersedia
     */
    public static function getAllStates(): array
    {
        return [
            self::STATE_WAITING_PAYMENT,
            self::STATE_WAITING_PROCESSING,
            self::STATE_PROCESSED,
            self::STATE_READY_FOR_PICKUP,
            self::STATE_COMPLETED,
            self::STATE_CANCELLED,
        ];
    }

    /**
     * Mendapatkan pesan error untuk transisi yang tidak valid
     *
     * @param string $from State saat ini
     * @param string $to State tujuan
     * @return string Pesan error dalam Bahasa Indonesia
     */
    public function getTransitionErrorMessage(string $from, string $to): string
    {
        $fromLabel = self::getStateLabel($from);
        $toLabel = self::getStateLabel($to);

        // Jika state sama
        if ($from === $to) {
            return "Order sudah dalam status {$fromLabel}";
        }

        // Jika state source tidak valid
        if (!isset(self::TRANSITIONS[$from])) {
            return "Status order tidak valid: {$from}";
        }

        // Jika state tujuan tidak diperbolehkan
        $allowed = array_map(
            fn($s) => self::getStateLabel($s),
            self::TRANSITIONS[$from]
        );
        $allowedList = implode(', ', $allowed);

        return "Tidak bisa mengubah status dari {$fromLabel} ke {$toLabel}. " .
               "Status yang diperbolehkan: {$allowedList}";
    }

    /**
     * Mendapatkan state awal untuk order baru
     *
     * @return string Initial state
     */
    public static function getInitialState(): string
    {
        return self::STATE_WAITING_PAYMENT;
    }

    /**
     * Cek apakah user dibolehkan membatalkan order dari state tertentu
     * User hanya bisa batalkan saat masih WAITING_PAYMENT
     *
     * @param string $currentState State saat ini
     * @return bool True jika user bisa batalkan
     */
    public function canUserCancel(string $currentState): bool
    {
        return $currentState === self::STATE_WAITING_PAYMENT;
    }

    /**
     * Cek apakah admin dibolehkan membatalkan order dari state tertentu
     * Admin bisa batalkan dari semua active states
     *
     * @param string $currentState State saat ini
     * @return bool True jika admin bisa batalkan
     */
    public function canAdminCancel(string $currentState): bool
    {
        return $this->isActiveState($currentState);
    }
}
