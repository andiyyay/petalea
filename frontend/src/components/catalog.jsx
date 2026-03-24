import { useState, useEffect } from "react";
import ProductCard from "./product";
import api from "../services/api";

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      setError("Gagal memuat produk");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-[80px] px-[60px] bg-white text-center" id="shop">
        <p className="text-[#6b7280]">Memuat produk...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-[80px] px-[60px] bg-white text-center" id="shop">
        <p className="text-red-500">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-[#e11d48] text-white rounded-full hover:bg-[#be123c]"
          onClick={fetchProducts}
        >
          Coba Lagi
        </button>
      </section>
    );
  }

  return (
    <section className="py-[80px] px-[60px] bg-white text-center" id="shop">
      <h2 className="text-[36px] font-semibold text-[#111]">Our Flowers</h2>
      <p className="mt-2 text-[#6b7280] mb-[50px]">
        Handcrafted floral arrangements for every moment
      </p>

      <div className="grid grid-cols-4 gap-8 max-[1024px]:grid-cols-2 max-[640px]:grid-cols-1">
        {products.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}
