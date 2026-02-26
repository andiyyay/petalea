import { FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white py-[60px] px-20 text-[#333]">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-10">
        {/* Brand */}
        <div>
          <h2 className="text-[#e6005c] text-[26px] mb-3">Petaléa</h2>
          <p className="leading-relaxed">
            Bringing beauty and joy through fresh <br />
            flowers since 2024.
          </p>
        </div>

        <div>
          <h4 className="text-base mb-[18px]">Shop</h4>
          <ul className="list-none p-0">
            <li className="mb-2.5 cursor-pointer hover:underline hover:text-[#e11d48]"><a href="#shop" className="text-inherit no-underline">All Bouquets</a></li>
            <li className="mb-2.5 cursor-pointer hover:underline hover:text-[#e11d48]">Seasonal Flowers</li>
            <li className="mb-2.5 cursor-pointer hover:underline hover:text-[#e11d48]">Best Sellers</li>
            <li className="mb-2.5 cursor-pointer hover:underline hover:text-[#e11d48]">Gift Sets</li>
          </ul>
        </div>

        <div>
          <h4 className="text-base mb-[18px]">Customer Care</h4>
          <ul className="list-none p-0">
            <li className="mb-2.5 cursor-pointer hover:underline hover:text-[#e11d48]">Delivery Info</li>
            <li className="mb-2.5 cursor-pointer hover:underline hover:text-[#e11d48]">Care Guide</li>
            <li className="mb-2.5 cursor-pointer hover:underline hover:text-[#e11d48]">Returns</li>
            <li className="mb-2.5 cursor-pointer hover:underline hover:text-[#e11d48]">FAQ</li>
          </ul>
        </div>

        <div>
          <h4 className="text-base mb-[18px]">Contact</h4>
          <ul className="list-none p-0">
            <li className="mb-2.5">SMK BPI Bandung</li>
            <li className="mb-2.5">Bandung City, Indonesia</li>
            <li className="mb-2.5">(012) 345-6789</li>
            <li className="mb-2.5">Petaleabloomy@iCloud.com</li>
          </ul>
        </div>
      </div>

      <hr className="my-10 border-none border-t border-[#e5e5e5]" />

      <div className="text-center flex flex-col items-center">
        <p className="mb-4">Follow us on Instagram</p>
        <a
          href="https://www.instagram.com/petaleaatelier"
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-block no-underline mb-5"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, #ffd600, #ff7a00, #ff0069, #d300c5, #7638fa)",
            }}
          >
            <FaInstagram className="text-white text-[30px]" />
          </div>
          <span className="block text-center mt-1 text-sm text-[#333]">@petaleaatelier</span>
        </a>
        <small className="text-[#777]">© 2026 Petaléa. All rights reserved.</small>
      </div>
    </footer>
  );
}
