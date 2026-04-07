import { useState, useEffect } from "react";
import api from "../services/api";
import { orderService, ORDER_STATES, ORDER_STATE_INFO } from "../services/orderService";
import ProgressIndicator from "../components/ProgressIndicator";
import { useCart } from "../contexts/CartContext";

function OrderHistory({ onClose }) {
  const { addToCart } = useCart();
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat riwayat pesanan:", err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const handleRestoreToCart = (order) => {
    if (order && order.items) {
      order.items.forEach((item) => {
        const productForCart = {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image_url || (item.product.image ? `/${item.product.image}` : null),
        };
        for (let i = 0; i < item.quantity; i++) {
          addToCart(productForCart);
        }
      });
      showNotification("Item berhasil dikembalikan ke keranjang", "success");
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  // Group orders by state
  const groupedOrders = filteredOrders.reduce((groups, order) => {
    const state = order.status || "unknown";
    if (!groups[state]) {
      groups[state] = [];
    }
    groups[state].push(order);
    return groups;
  }, {});

  const stateOrder = [
    ORDER_STATES.WAITING_PAYMENT,
    ORDER_STATES.WAITING_PROCESSING,
    ORDER_STATES.PROCESSED,
    ORDER_STATES.READY_FOR_PICKUP,
    ORDER_STATES.COMPLETED,
    ORDER_STATES.CANCELLED,
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Riwayat Pemesanan
          </h2>
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

        {/* Filter tabs */}
        <div className="flex gap-2 px-4 sm:px-6 py-4 border-b overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === "all"
                ? "bg-[#e91e63] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Semua
          </button>
          {stateOrder.map((state) => (
            <button
              key={state}
              onClick={() => setFilter(state)}
              className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                filter === state
                  ? "bg-[#e91e63] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {ORDER_STATE_INFO[state]?.icon === "clock" && (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              )}
              {ORDER_STATE_INFO[state]?.icon === "hourglass" && (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 22h14" />
                  <path d="M5 2h14" />
                  <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L5 2v20" />
                </svg>
              )}
              {ORDER_STATE_INFO[state]?.icon === "package" && (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                </svg>
              )}
              {ORDER_STATE_INFO[state]?.icon === "checkCircle" && state !== ORDER_STATES.CANCELLED && (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
              {ORDER_STATE_INFO[state]?.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-10 h-10 border-4 border-[#e91e63] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Memuat riwayat pesanan...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <p className="text-gray-500 text-lg">
                {filter === "all"
                  ? "Belum ada pesanan"
                  : `Tidak ada pesanan ${ORDER_STATE_INFO[filter]?.label.toLowerCase()}`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedOrders)
                .sort((a, b) => {
                  const aIndex = stateOrder.indexOf(a[0]);
                  const bIndex = stateOrder.indexOf(b[0]);
                  return aIndex - bIndex;
                })
                .map(([state, stateOrders]) => (
                  <div key={state} className="space-y-3">
                    {/* State Header */}
                    {filter === "all" && (
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            ORDER_STATE_INFO[state]?.bgColor || "bg-gray-300"
                          }`}
                        />
                        <h3 className="text-sm font-semibold text-gray-700">
                          {ORDER_STATE_INFO[state]?.label || state} ({stateOrders.length})
                        </h3>
                      </div>
                    )}

                    {/* Orders in this state */}
                    {stateOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Order Header - Always Visible */}
                        <div
                          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => toggleOrderExpand(order.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-800">
                                {order.order_number}
                              </p>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${orderService.getStatusColor(
                                  order.status
                                )}`}
                              >
                                {orderService.getStatusLabel(order.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(order.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-lg text-[#e91e63]">
                              Rp {order.total_amount?.toLocaleString("id-ID")}
                            </p>
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
                              className={`transition-transform ${
                                expandedOrders[order.id] ? "rotate-180" : ""
                              }`}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>

                        {/* Order Details - Expandable */}
                        {expandedOrders[order.id] && (
                          <div className="p-4 border-t animate-in slide-in-from-top-2">
                            {/* Progress Indicator for active orders */}
                            {order.status !== ORDER_STATES.COMPLETED &&
                              order.status !== ORDER_STATES.CANCELLED && (
                              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-2">Progres Pesanan:</p>
                                <ProgressIndicator
                                  currentState={order.status}
                                  compact={true}
                                />
                              </div>
                            )}

                            {/* Order Items */}
                            <div className="space-y-3 mb-4">
                              <p className="text-sm font-medium text-gray-700">
                                Item Pesanan:
                              </p>
                              {order.items?.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                                >
                                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                                    <img
                                      src={item.product?.image_url || item.product?.image}
                                      alt={item.product?.name}
                                      className="w-full h-full object-cover rounded-lg"
                                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                    />
                                    <span className="text-3xl" style={{ display: 'none' }}>🌸</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-800">
                                      {item.product?.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {item.quantity} x Rp{" "}
                                      {item.price?.toLocaleString("id-ID")}
                                    </p>
                                  </div>
                                  <p className="font-semibold text-gray-800">
                                    Rp {item.subtotal?.toLocaleString("id-ID")}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Metode Pembayaran:</p>
                                <p className="font-medium text-gray-800">
                                  {order.payment_method === "qris"
                                    ? "QRIS"
                                    : order.payment_method === "cash"
                                    ? "Tunai"
                                    : order.payment_method || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Catatan:</p>
                                <p className="font-medium text-gray-800">
                                  {order.notes || "-"}
                                </p>
                              </div>
                            </div>

                            {/* Payment Button for WAITING_PAYMENT */}
                            {order.status === ORDER_STATES.WAITING_PAYMENT && order.payment_url && (
                              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  <p className="text-sm text-amber-800">Selesaikan pembayaran Anda sebelum kadaluarsa.</p>
                                </div>
                                <a
                                  href={order.payment_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-4 py-2 bg-[#e91e63] text-white hover:bg-pink-700 rounded-lg transition-colors font-medium text-sm whitespace-nowrap shadow-sm w-full sm:w-auto text-center"
                                >
                                  Bayar Sekarang
                                </a>
                              </div>
                            )}

                            {/* Cancel Reason */}
                            {order.status === ORDER_STATES.CANCELLED && (
                              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#dc2626"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mt-0.5 min-w-[16px]"
                                  >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="m15 9-6 6" />
                                    <path d="m9 9 6 6" />
                                  </svg>
                                  <div>
                                    <p className="text-sm font-medium text-red-800">
                                      Dibatalkan
                                    </p>
                                    <p className="text-sm text-red-700">
                                      {order.cancelled_reason || "Pesanan telah dibatalkan."}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestoreToCart(order);
                                  }}
                                  className="px-4 py-2 bg-white border border-red-200 text-red-700 hover:bg-red-100 rounded-lg transition-colors font-medium text-sm whitespace-nowrap shadow-sm w-full sm:w-auto"
                                >
                                  Pesan Ulang
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderHistory;
