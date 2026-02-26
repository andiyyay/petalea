import ProductCard from "./product";

const products = [
  { id: 1, name: "Rose Bouquet", price: 250000, image: "/rose_bouquet.jpeg" },
  { id: 2, name: "Lily Flower", price: 200000, image: "/lily.jpeg" },
  { id: 3, name: "Tulip Blossom", price: 300000, image: "/tulip.jpeg" },
  { id: 4, name: "Sunflower", price: 180000, image: "/sunflower.jpeg" },
  { id: 5, name: "Thumbelina Bouquet", price: 150000, image: "/thumbelina.jpeg" },
  { id: 6, name: "Hydrangea Bouquet", price: 210000, image: "/hydrangea.jpg" },
  { id: 7, name: "Daisy Bouquet", price: 200000, image: "/daisy.jpeg" },
  { id: 8, name: "Ranunculus Bouquet", price: 155000, image: "/ranunculus.jpeg" },
  { id: 9, name: "Prettiest Peony Bouquet", price: 155000, image: "/peonies.jpg" },
  { id: 10, name: "Korean Bouquet", price: 345000, image: "/korean.jpg" },
  { id: 11, name: "Classic Gentleman Bloom", price: 275000, image: "/classic.jpg" },
  { id: 12, name: "Romantical bouquet", price: 335000, image: "/romantical.jpg" },
];

export default function Catalog() {
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
