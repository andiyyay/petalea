import "./footer.css";
import { FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-col brand">
          <h2>Petaléa</h2>
          <p>
            Bringing beauty and joy through fresh <br />
            flowers since 2024.
          </p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><a href="#shop">All Bouquets</a></li>
            <li>Seasonal Flowers</li>
            <li>Best Sellers</li>
            <li>Gift Sets</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Customer Care</h4>
          <ul>
            <li>Delivery Info</li>
            <li>Care Guide</li>
            <li>Returns</li>
            <li>FAQ</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li>SMK BPI Bandung</li>
            <li>Bandung City, Indonesia</li>
            <li>(012) 345-6789</li>
            <li>Petaleabloomy@iCloud.com</li>
          </ul>
        </div>
      </div>

      <hr />

      <div className="footer-bottom">
        <p>Follow us on Instagram</p>
        <a href="https://www.instagram.com/a.ndiyya/" target="_blank" rel="noopener noreferrer" 
        className="ig-wrapper">
            <div className="ig-circle">
            <FaInstagram className="ig-icon" />
          </div>
          <span>@a.ndiyya</span>
        </a>
        
        <small>© 2026 Petaléa. All rights reserved.</small>
      </div>
    </footer>
  );
}
