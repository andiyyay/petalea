import { useState, useEffect } from "react";
import { productService } from "../services/productService";

function Admin({ user, onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: null,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError("Gagal memuat produk: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, data);
      } else {
        await productService.create(data);
      }
      await loadProducts();
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan produk");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      image: null,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    try {
      await productService.delete(id);
      await loadProducts();
    } catch (err) {
      setError("Gagal menghapus produk: " + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", image: null });
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[900px] max-h-[80vh] p-[42px] rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[9999]">
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[900px] max-h-[80vh] overflow-hidden p-[42px] rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[9999]">
      <button
        className="absolute top-4 right-4 bg-transparent border-none text-[22px] cursor-pointer"
        onClick={onClose}
      >
        ✕
      </button>

      <h2 className="text-center mb-2">Admin Panel - Kelola Produk</h2>
      <p className="text-center text-[#555] mb-6 text-[14px]">Selamat datang, {user?.name}</p>

      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      {!showForm ? (
        <>
          <button
            className="w-full p-3 mb-4 bg-[#e11d48] text-white border-none rounded-xl text-base cursor-pointer hover:bg-[#be123c] transition-colors duration-300"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + Tambah Produk Baru
          </button>

          <div className="overflow-y-auto max-h-[50vh]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Gambar</th>
                  <th className="text-left py-3 px-2">Nama</th>
                  <th className="text-left py-3 px-2">Harga</th>
                  <th className="text-center py-3 px-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="py-3 px-2">{product.name}</td>
                    <td className="py-3 px-2">Rp {product.price.toLocaleString("id-ID")}</td>
                    <td className="py-3 px-2 text-center">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600 text-sm"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                        onClick={() => handleDelete(product.id)}
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
            className="mb-4 text-[#e11d48] cursor-pointer hover:underline"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
          >
            ← Kembali
          </button>

          <form onSubmit={handleSubmit}>
            <label className="block pt-2 pb-2 mb-2 font-semibold">Nama Produk</label>
            <input
              className="w-full p-3 rounded-[10px] border border-[#ddd] mb-3 outline-none focus:border-[#e6005c]"
              type="text"
              name="name"
              placeholder="Contoh: Rose Bouquet"
              value={formData.name}
              onChange={handleInputChange}
              required
            />

            <label className="block pt-2 pb-2 mb-2 font-semibold">Harga (Rp)</label>
            <input
              className="w-full p-3 rounded-[10px] border border-[#ddd] mb-3 outline-none focus:border-[#e6005c]"
              type="number"
              name="price"
              placeholder="Contoh: 250000"
              value={formData.price}
              onChange={handleInputChange}
              required
            />

            <label className="block pt-2 pb-2 mb-2 font-semibold">
              Gambar {editingProduct ? "(Kosongkan untuk tidak mengubah)" : ""}
            </label>
            <input
              className="w-full p-3 rounded-[10px] border border-[#ddd] mb-4 outline-none focus:border-[#e6005c]"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              {...(!editingProduct && { required: true })}
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 p-3 bg-[#e6005c] text-white border-none rounded-xl text-base cursor-pointer hover:bg-[#cc0052] transition-colors duration-300"
              >
                {editingProduct ? "Update Produk" : "Tambah Produk"}
              </button>
              <button
                type="button"
                className="px-6 py-3 border border-[#ddd] rounded-xl cursor-pointer hover:bg-gray-100 transition-colors duration-300"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Batal
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default Admin;
