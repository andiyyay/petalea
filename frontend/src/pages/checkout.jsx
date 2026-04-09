import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { createPayment } from "../services/paymentService";
import PaymentMethodSelector from "../components/PaymentMethodSelector";

export default function Checkout({ onClose, user, onPaymentPending }) {
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");

  const [customerInfo, setCustomerInfo] = useState({
    full_name: user?.name || "",
    phone: "",
    notes: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!customerInfo.full_name.trim()) {
      setError("Nama lengkap harus diisi");
      return false;
    }
    if (!customerInfo.phone.trim()) {
      setError("Nomor telepon harus diisi");
      return false;
    }
    if (!selectedPayment) {
      setError("Pilih metode pembayaran");
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      const paymentData = {
        items: cart.map((item) => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: cartTotal,
        shipping_cost: 0,
        total: cartTotal,
        customer_info: customerInfo,
        payment_method: selectedPayment,
        shipping_type: "SELF_PICKUP",
      };

      const response = await createPayment(paymentData);

      if (response.data?.payment_url) {
        // Store pending order info for recovery if redirect fails
        localStorage.setItem('pendingOrder', JSON.stringify({
          order_id: response.data.order_id,
          order_number: response.data.order_number,
          timestamp: Date.now()
        }));
        
        clearCart();
        onPaymentPending(response.data);
        window.location.href = response.data.payment_url;
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Terjadi kesalahan saat memproses pembayaran"
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#e11d48"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.6 13h11.4l2-8H6" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">Keranjang Kosong</h2>
          <p className="text-gray-500 mb-4">
            Tambahkan produk ke keranjang sebelum checkout
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#e11d48] text-white rounded-full hover:bg-[#be123c] transition-colors"
          >
            Kembali ke Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      <div className="relative min-h-screen md:min-h-0 md:absolute md:inset-auto md:right-0 md:top-0 md:h-full md:w-full md:max-w-2xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-semibold text-[#111]">Checkout</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Ringkasan Pesanan</h3>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between">
              <span className="font-medium text-gray-700">Subtotal</span>
              <span className="font-semibold text-[#e11d48]">
                Rp {cartTotal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Self Pick Up Info */}
          <div className="bg-pink-50 rounded-xl p-4 flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e11d48"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-800">Self Pick Up (Ambil Sendiri)</h4>
              <p className="text-sm text-gray-600 mt-1">
                Pesanan Anda dapat diambil di toko setelah pembayaran berhasil. Kami akan menghubungi Anda ketika pesanan siap.
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Informasi Penerima</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                name="full_name"
                value={customerInfo.full_name}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e11d48] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon *
              </label>
              <input
                type="tel"
                name="phone"
                value={customerInfo.phone}
                onChange={handleInputChange}
                placeholder="Contoh: 08123456789"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e11d48] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan (Opsional)
              </label>
              <textarea
                name="notes"
                value={customerInfo.notes}
                onChange={handleInputChange}
                placeholder="Waktu pengambilan, request khusus, dll."
                rows="2"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e11d48] focus:border-transparent outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <PaymentMethodSelector
            selected={selectedPayment}
            onSelect={setSelectedPayment}
          />
        </div>

        {/* Footer with Total */}
        <div className="border-t p-6 bg-gray-50 space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>Rp {cartTotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Pengiriman</span>
              <span className="text-green-600">Gratis (Self Pick Up)</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
              <span>Total</span>
              <span className="text-[#e11d48]">Rp {cartTotal.toLocaleString("id-ID")}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-[#e11d48] text-white py-3 rounded-full font-semibold hover:bg-[#be123c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
              strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Memproses...
              </>
            ) : (
              "Bayar Sekarang"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
