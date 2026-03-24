import { useState, useEffect } from "react";
import api from "../services/api";
import { orderService, ORDER_STATES } from "../services/orderService";
import ProgressIndicator from "../components/ProgressIndicator";

function OrderStatus({ onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  const fetchActiveOrders = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.get("/orders/active", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat pesanan aktif:", err);
      showNotification("Gagal memuat pesanan aktif", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const handleCancelClick = (orderId) => {
    setCancellingOrderId(orderId);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      showNotification("Harap isi alasan pembatalan", "error");
      return;
    }

    try {
      await orderService.userCancelOrder(cancellingOrderId, cancelReason);
      showNotification("Pesanan berhasil dibatalkan", "success");
      setShowCancelModal(false);
      setCancelReason("");
      setCancellingOrderId(null);
      await fetchActiveOrders();
    } catch (err) {
      console.error("Gagal membatalkan pesanan:", err);
      showNotification(
        err.response?.data?.message || "Gagal membatalkan pesanan",
        "error"
      );
    }
  };

  const canCancel = (order) => {
    return order.status === ORDER_STATES.WAITING_PAYMENT;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Status Pesanan</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
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

        {/* Notification */}
        {notification.show && (
          <div
            className={`mx-4 sm:mx-6 mt-4 p-3 rounded-lg ${
              notification.type === "error"
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-green-100 text-green-800 border border-green-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "error" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-10 h-10 border-4 border-[#e91e63] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Memuat status pesanan...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#e91e63"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-4"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.6 13h11.4l2-8H6" />
              </svg>
              <p className="text-gray-500 text-lg">Belum ada pesanan aktif</p>
              <p className="text-gray-400 text-sm mt-2">
                Pesanan aktif Anda akan muncul di sini
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">
                        {order.order_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${orderService.getStatusColor(
                        order.status
                      )}`}
                    >
                      {orderService.getStatusIcon(order.status)}
                      <span>{orderService.getStatusLabel(order.status)}</span>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                    <p className="text-xs text-gray-500 mb-3 text-center font-medium">
                      Progres Pesanan Anda
                    </p>
                    <ProgressIndicator currentState={order.status} />
                  </div>

                  {/* Order Items */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Item Pesanan:</p>
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            {item.product?.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-2xl">
                                {item.product?.image || "🌸"}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {item.product?.name}
                            </p>
                            <p className="text-gray-500">
                              {item.quantity} x Rp {item.price?.toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Total & Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Total Pembayaran</p>
                      <p className="font-bold text-xl text-[#e91e63]">
                        Rp {order.total_amount?.toLocaleString("id-ID")}
                      </p>
                    </div>
                    {canCancel(order) && (
                      <button
                        onClick={() => handleCancelClick(order.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors font-medium text-sm flex items-center gap-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="m15 9-6 6" />
                          <path d="m9 9 6 6" />
                        </svg>
                        Batalkan
                      </button>
                    )}
                  </div>

                  {/* Info for non-cancelled orders */}
                  {order.status !== ORDER_STATES.CANCELLED && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4" />
                          <path d="M12 8h.01" />
                        </svg>
                        <div className="text-sm">
                          {order.status === ORDER_STATES.WAITING_PAYMENT && (
                            <p className="text-blue-800">
                              Silakan selesaikan pembayaran Anda. Pesanan akan diproses setelah pembayaran dikonfirmasi.
                            </p>
                          )}
                          {order.status === ORDER_STATES.WAITING_PROCESSING && (
                            <p className="text-blue-800">
                              Pembayaran telah dikonfirmasi. Pesanan Anda sedang antri untuk diproses.
                            </p>
                          )}
                          {order.status === ORDER_STATES.PROCESSED && (
                            <p className="text-blue-800">
                              Pesanan Anda sedang diproses oleh tim kami. Estimasi selesai: 1-2 jam.
                            </p>
                          )}
                          {order.status === ORDER_STATES.READY_FOR_PICKUP && (
                            <p className="text-green-800 font-medium">
                              Pesanan Anda sudah selesai! Silakan ambil di toko kami.
                            </p>
                          )}
                          {order.status === ORDER_STATES.COMPLETED && (
                            <p className="text-green-800 font-medium">
                              Pesanan telah selesai. Terima kasih telah berbelanja di Petaléa!
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in fade-in-50 zoom-in-95">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Batalkan Pesanan</h3>
            <p className="text-gray-600 text-sm mb-4">
              Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Pembatalan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Contoh: Berubah pikiran, menemukan alternatif lain, dll."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e91e63] focus:border-[#e91e63] outline-none resize-none"
              rows={3}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setCancellingOrderId(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderStatus;
