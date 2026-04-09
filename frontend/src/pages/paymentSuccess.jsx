import { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { getPaymentStatus } from "../services/paymentService";
import { orderService, ORDER_STATES } from "../services/orderService";
import ProgressIndicator from "../components/ProgressIndicator";

export default function PaymentSuccess({ onClose }) {
  const { clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState(null);
  const [animating, setAnimating] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  const getOrderDetails = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("order_id");
    const paymentId = urlParams.get("payment_id");
    return { orderId, paymentId };
  };

  useEffect(() => {
    clearCart();
    const timer = setTimeout(() => setAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [clearCart]);

  useEffect(() => {
    const details = getOrderDetails();
    setOrderDetails(details);
  }, []);

  // Poll for payment status
  useEffect(() => {
    if (!orderDetails?.paymentId) return;

    const checkPaymentStatus = async () => {
      try {
        const response = await getPaymentStatus(orderDetails.paymentId);
        setPaymentStatus(response.data);
        setLoading(false);

        // If still waiting payment, continue polling
        if (response.data?.order_status === ORDER_STATES.WAITING_PAYMENT && pollCount < 10) {
          setTimeout(() => setPollCount((c) => c + 1), 3000);
        }
      } catch (err) {
        console.error("Failed to check payment status:", err);
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderDetails?.paymentId, pollCount]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`bg-white rounded-2xl p-8 max-w-md w-full text-center transform transition-all duration-500 ${
          animating ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transform transition-all duration-500 ${
                animating ? "scale-0" : "scale-100"
              }`}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Pembayaran Berhasil!
          </h2>
          <p className="text-gray-500">
            Terima kasih telah berbelanja di Petaléa
          </p>
        </div>

        {orderDetails?.orderId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Nomor Pesanan</p>
            <p className="text-lg font-semibold text-[#e11d48]">
              {orderDetails.orderId}
            </p>
          </div>
        )}

        {/* Payment Status Section */}
        {loading ? (
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span className="text-blue-700">Memverifikasi pembayaran...</span>
            </div>
          </div>
        ) : paymentStatus?.order_status === ORDER_STATES.WAITING_PROCESSING ? (
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="font-medium">Pembayaran telah dikonfirmasi!</span>
            </div>
            <div className="mt-3">
              <ProgressIndicator currentState={paymentStatus.order_status} compact={true} />
            </div>
          </div>
        ) : paymentStatus?.order_status === ORDER_STATES.WAITING_PAYMENT ? (
          <div className="bg-yellow-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-yellow-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="font-medium">Menunggu konfirmasi pembayaran...</span>
            </div>
            <p className="text-sm text-yellow-600 mt-2">
              Pembayaran Anda sedang diproses. Halaman ini akan diperbarui secara otomatis.
            </p>
          </div>
        ) : null}

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>Kami akan menghubungi Anda untuk konfirmasi pengiriman</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span>Pesanan Anda sedang diproses</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onClose();
              window.location.href = "/order-status";
            }}
            className="flex-1 px-6 py-3 bg-[#e11d48] text-white rounded-full font-semibold hover:bg-[#be123c] transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Lacak Pesanan
          </button>
          <button
            onClick={() => {
              onClose();
              window.location.href = "#shop";
            }}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors"
          >
            Lanjut Belanja
          </button>
        </div>
      </div>
    </div>
  );
}
