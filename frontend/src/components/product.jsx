export default function ProductCard({ product }) {
  return (
    <div
      id={`product-${product.id}`}
      className="bg-white rounded-2xl overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-[transform,box-shadow] duration-300 hover:-translate-y-[10px] hover:shadow-[0_25px_40px_rgba(0,0,0,0.15)]"
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-[260px] object-cover"
      />

      <div className="p-5 text-center">
        <h3 className="text-lg mb-1.5">{product.name}</h3>
        <p className="text-[#e11d48] font-semibold mb-4">
          Rp {product.price.toLocaleString("id-ID")}
        </p>

        <button className="border-none bg-[#e11d48] text-white py-2.5 px-5 rounded-full cursor-pointer hover:bg-[#be123c] transition-colors duration-300">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
