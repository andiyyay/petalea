import "../styles/product.css";

export default function ProductCard({ product }) {
  return (
    <div
      id={`product-${product.id}`}
      className="product-card"
    >
      <img src={product.image} alt={product.name} />

      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">
          Rp {product.price.toLocaleString("id-ID")}
        </p>

        <button className="add-cart">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
