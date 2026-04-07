import { useState, useEffect } from "react";
import { productService } from "../services/productService";
import { orderService, ORDER_STATES, ORDER_STATE_INFO } from "../services/orderService";
import ProgressIndicator from "../components/ProgressIndicator";

function Admin({ user, onClose }) {
  const [activeTab, setActiveTab] = useState("products"); // 'products' | 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Product form states
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: "",
    price: "",
    stock: "",
    image: null,
  });

  // Order states
  const [orderFilter, setOrderFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "products") {
        await loadProducts();
      } else {
        await loadOrders();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError("Gagal memuat produk: " + (err.response?.data?.message || err.message));
    }
  };

  const loadOrders = async () => {
    try {
      const data = await orderService.getAllOrders();
      setOrders(data || []);
    } catch (err) {
      setError("Gagal memuat pesanan: " + (err.response?.data?.message || err.message));
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Product handlers
  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setProductFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const data = new FormData();
    data.append("name", productFormData.name);
    data.append("price", productFormData.price);
    data.append("stock", productFormData.stock);
    if (productFormData.image) {
      data.append("image", productFormData.image);
    }

    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, data);
        showNotification("Produk berhasil diperbarui");
      } else {
        await productService.create(data);
        showNotification("Produk berhasil ditambahkan");
      }
      await loadProducts();
      resetProductForm();
      setShowProductForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan produk");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      price: product.price,
      stock: product.stock ?? "",
      image: null,
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    try {
      await productService.delete(id);
      showNotification("Produk berhasil dihapus");
      await loadProducts();
    } catch (err) {
      setError("Gagal menghapus produk: " + (err.response?.data?.message || err.message));
    }
  };

  const resetProductForm = () => {
    setProductFormData({ name: "", price: "", stock: "", image: null });
    setEditingProduct(null);
  };

  // Order handlers
  const handleOrderAction = async (action, orderId) => {
    setActionLoading(action);
    try {
      switch (action) {
        case "process":
          await orderService.transitionToProcessed(orderId);
          showNotification("Pesanan diproses");
          break;
        case "ready":
          await orderService.transitionToReadyForPickup(orderId);
          showNotification("Pesanan siap diambil");
          break;
        case "complete":
          await orderService.transitionToCompleted(orderId);
          showNotification("Pesanan selesai");
          break;
      }
      await loadOrders();
      if (selectedOrder) {
        const updated = await orderService.getAdminOrderById(orderId);
        setSelectedOrder(updated);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Gagal mengupdate pesanan", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      showNotification("Harap isi alasan pembatalan", "error");
      return;
    }

    setActionLoading("cancel");
    try {
      await orderService.cancelOrder(selectedOrder.id, "admin", cancelReason);
      showNotification("Pesanan dibatalkan");
      setShowCancelModal(false);
      setCancelReason("");
      await loadOrders();
      setShowOrderDetail(false);
      setSelectedOrder(null);
    } catch (err) {
      showNotification(err.response?.data?.message || "Gagal membatalkan pesanan", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewOrder = async (order) => {
    try {
      const fullOrder = await orderService.getAdminOrderById(order.id);
      setSelectedOrder(fullOrder);
      setShowOrderDetail(true);
    } catch (err) {
      showNotification("Gagal memuat detail pesanan", "error");
    }
  };

  const getFilteredOrders = () => {
    if (orderFilter === "all") return orders;
    return orders.filter((o) => o.status === orderFilter);
  };

  if (loading && activeTab === "products" && products.length === 0) {
    return (
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[95vw] sm:w-[900px] max-h-[90vh] p-6 sm:p-[42px] rounded-2xl shadow-2xl z-[9999]">
        <div className="text-center py-10">
          <div className="inline-block w-10 h-10 border-4 border-[#e91e63] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Admin Panel */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[95vw] sm:w-[900px] max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl z-[9999] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Admin Panel</h2>
            <p className="text-sm text-gray-500">Selamat datang, {user?.name}</p>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            onClick={onClose}
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
            className={`mx-6 mt-4 p-3 rounded-lg ${
              notification.type === "error"
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-green-100 text-green-800 border border-green-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "error" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === "products"
                ? "text-[#e91e63] border-b-2 border-[#e91e63]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Produk
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === "orders"
                ? "text-[#e91e63] border-b-2 border-[#e91e63]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pesanan
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

              {!showProductForm ? (
                <>
                  <button
                    className="w-full sm:w-auto px-6 py-3 bg-[#e11d48] text-white rounded-xl font-medium hover:bg-[#be123c] transition-colors mb-4"
                    onClick={() => {
                      resetProductForm();
                      setShowProductForm(true);
                    }}
                  >
                    + Tambah Produk Baru
                  </button>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50">
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 sm:px-4">Gambar</th>
                          <th className="text-left py-3 px-2 sm:px-4">Nama</th>
                          <th className="text-left py-3 px-2 sm:px-4">Harga</th>
                          <th className="text-left py-3 px-2 sm:px-4">Stok</th>
                          <th className="text-center py-3 px-2 sm:px-4">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2 sm:px-4">
                              <img
                                src={product.image_url || product.image}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            </td>
                            <td className="py-3 px-2 sm:px-4">{product.name}</td>
                            <td className="py-3 px-2 sm:px-4">
                              Rp {product.price.toLocaleString("id-ID")}
                            </td>
                            <td className="py-3 px-2 sm:px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                product.stock > 10
                                  ? "bg-green-100 text-green-800"
                                  : product.stock > 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {product.stock ?? 0}
                              </span>
                            </td>
                            <td className="py-3 px-2 sm:px-4 text-center">
                              <button
                                className="bg-blue-500 text-white px-3 py-1 rounded-lg mr-2 hover:bg-blue-600 text-sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                Edit
                              </button>
                              <button
                                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <button
                    className="mb-4 text-[#e11d48] hover:underline flex items-center gap-1"
                    onClick={() => {
                      setShowProductForm(false);
                      resetProductForm();
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m15 18-6-6" />
                      <path d="m9 6 6 6" />
                    </svg>
                    Kembali
                  </button>

                  <form onSubmit={handleProductSubmit} className="max-w-md">
                    <label className="block mb-2 font-semibold text-gray-700">
                      Nama Produk
                    </label>
                    <input
                      className="w-full p-3 rounded-xl border border-gray-300 mb-4 outline-none focus:border-[#e91e63] transition-colors"
                      type="text"
                      name="name"
                      placeholder="Contoh: Rose Bouquet"
                      value={productFormData.name}
                      onChange={handleProductInputChange}
                      required
                    />

                    <label className="block mb-2 font-semibold text-gray-700">
                      Harga (Rp)
                    </label>
                    <input
                      className="w-full p-3 rounded-xl border border-gray-300 mb-4 outline-none focus:border-[#e91e63] transition-colors"
                      type="number"
                      name="price"
                      placeholder="Contoh: 250000"
                      value={productFormData.price}
                      onChange={handleProductInputChange}
                      required
                    />

                    <label className="block mb-2 font-semibold text-gray-700">
                      Stok
                    </label>
                    <input
                      className="w-full p-3 rounded-xl border border-gray-300 mb-4 outline-none focus:border-[#e91e63] transition-colors"
                      type="number"
                      name="stock"
                      placeholder="Contoh: 50"
                      value={productFormData.stock}
                      onChange={handleProductInputChange}
                      required
                      min="0"
                    />

                    <label className="block mb-2 font-semibold text-gray-700">
                      Gambar {editingProduct ? "(Kosongkan untuk tidak mengubah)" : ""}
                    </label>
                    <input
                      className="w-full p-3 rounded-xl border border-gray-300 mb-6 outline-none focus:border-[#e91e63] transition-colors"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      {...(!editingProduct && { required: true })}
                    />

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 p-3 bg-[#e91e63] text-white rounded-xl font-medium hover:bg-[#d81b60] transition-colors"
                      >
                        {editingProduct ? "Update Produk" : "Tambah Produk"}
                      </button>
                      <button
                        type="button"
                        className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setShowProductForm(false);
                          resetProductForm();
                        }}
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Order Filters */}
              <div className="flex gap-2 px-4 sm:px-6 py-3 border-b overflow-x-auto">
                <button
                  onClick={() => setOrderFilter("all")}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                    orderFilter === "all"
                      ? "bg-[#e91e63] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Semua
                </button>
                {[
                  ORDER_STATES.WAITING_PAYMENT,
                  ORDER_STATES.WAITING_PROCESSING,
                  ORDER_STATES.PROCESSED,
                  ORDER_STATES.READY_FOR_PICKUP,
                  ORDER_STATES.COMPLETED,
                  ORDER_STATES.CANCELLED,
                ].map((state) => (
                  <button
                    key={state}
                    onClick={() => setOrderFilter(state)}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                      orderFilter === state
                        ? "bg-[#e91e63] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {ORDER_STATE_INFO[state]?.label}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-10 h-10 border-4 border-[#e91e63] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : getFilteredOrders().length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Tidak ada pesanan</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50">
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm">No. Pesanan</th>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm">Pelanggan</th>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">Tanggal</th>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm">Status</th>
                          <th className="text-right py-3 px-2 sm:px-4 text-xs sm:text-sm">Total</th>
                          <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredOrders().map((order) => (
                          <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2 sm:px-4 font-medium">
                              {order.order_number}
                            </td>
                            <td className="py-3 px-2 sm:px-4">
                              {order.user?.name || "-"}
                            </td>
                            <td className="py-3 px-2 sm:px-4 hidden sm:table-cell text-gray-500">
                              {new Date(order.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </td>
                            <td className="py-3 px-2 sm:px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${orderService.getStatusColor(
                                  order.status
                                )}`}
                              >
                                {orderService.getStatusLabel(order.status)}
                              </span>
                            </td>
                            <td className="py-3 px-2 sm:px-4 text-right font-medium">
                              Rp {order.total_amount?.toLocaleString("id-ID")}
                            </td>
                            <td className="py-3 px-2 sm:px-4 text-center">
                              <button
                                onClick={() => handleViewOrder(order)}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in-50 zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedOrder.order_number}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(selectedOrder.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowOrderDetail(false);
                  setSelectedOrder(null);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
              {/* Status Badge & Progress */}
              <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Status Saat Ini:</span>
                  <span
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${orderService.getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {orderService.getStatusIconType(selectedOrder.status) === "clock" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    )}
                    {orderService.getStatusIconType(selectedOrder.status) === "hourglass" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14" /><path d="M5 2h14" /><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" /><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" /></svg>
                    )}
                    {orderService.getStatusIconType(selectedOrder.status) === "package" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22v-9" /></svg>
                    )}
                    {orderService.getStatusIconType(selectedOrder.status) === "checkCircle" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    )}
                    {orderService.getStatusIconType(selectedOrder.status) === "xCircle" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                    )}
                    {orderService.getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                {selectedOrder.status !== ORDER_STATES.CANCELLED &&
                  selectedOrder.status !== ORDER_STATES.COMPLETED && (
                  <ProgressIndicator currentState={selectedOrder.status} compact={true} />
                )}
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Informasi Pelanggan</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="font-medium">{selectedOrder.user?.name || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{selectedOrder.user?.phone || "-"}</span>
                  </div>
                  {selectedOrder.notes && (
                    <div className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mt-0.5">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span className="text-sm text-gray-600">{selectedOrder.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Item Pesanan</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        {item.product?.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-2xl">{item.product?.image || "🌸"}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.product?.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x Rp {item.price?.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-800">
                        Rp {item.subtotal?.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Informasi Pembayaran</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Metode:</span>
                    <span className="font-medium">
                      {selectedOrder.payment_method === "qris"
                        ? "QRIS"
                        : selectedOrder.payment_method === "cash"
                        ? "Tunai"
                        : selectedOrder.payment_method || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-bold text-lg text-[#e91e63]">
                      Rp {selectedOrder.total_amount?.toLocaleString("id-ID")}
                    </span>
                  </div>
                  {selectedOrder.paid_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dibayar pada:</span>
                      <span className="text-sm">
                        {new Date(selectedOrder.paid_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cancel Reason */}
              {selectedOrder.status === ORDER_STATES.CANCELLED &&
                selectedOrder.cancelled_reason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" className="mt-0.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m15 9-6 6" />
                      <path d="m9 9 6 6" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Alasan Pembatalan:
                      </p>
                      <p className="text-sm text-red-700">{selectedOrder.cancelled_reason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 sm:p-6 border-t bg-gray-50">
              <div className="flex flex-wrap gap-2">
                {selectedOrder.status === ORDER_STATES.WAITING_PROCESSING && (
                  <button
                    onClick={() => handleOrderAction("process", selectedOrder.id)}
                    disabled={actionLoading === "process"}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === "process" ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m7.5 4.27 9 5.15" />
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        </svg>
                        Proses
                      </>
                    )}
                  </button>
                )}
                {selectedOrder.status === ORDER_STATES.PROCESSED && (
                  <button
                    onClick={() => handleOrderAction("ready", selectedOrder.id)}
                    disabled={actionLoading === "ready"}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === "ready" ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        Siap Diambil
                      </>
                    )}
                  </button>
                )}
                {selectedOrder.status === ORDER_STATES.READY_FOR_PICKUP && (
                  <button
                    onClick={() => handleOrderAction("complete", selectedOrder.id)}
                    disabled={actionLoading === "complete"}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === "complete" ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        Selesai
                      </>
                    )}
                  </button>
                )}
                {selectedOrder.status === ORDER_STATES.WAITING_PAYMENT && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m15 9-6 6" />
                      <path d="m9 9 6 6" />
                    </svg>
                    Batalkan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
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
              placeholder="Contoh: Stok habis, pesanan tidak valid, dll."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e91e63] focus:border-[#e91e63] outline-none resize-none"
              rows={3}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={actionLoading === "cancel"}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === "cancel" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Ya, Batalkan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Admin;
