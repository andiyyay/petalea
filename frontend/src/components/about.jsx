import "../styles/about.css";

export default function AboutSection() {
  return (
    <section className="about-section" id="about">
      <h2 className="about-title">About Petaléa</h2>
      <div className="about-underline"></div>

      <div className="about-cards">
        <div className="about-card">
          <span className="about-icon">🌸</span>
          <h3>Our Story</h3>
          <p>
            Founded in 2010, Petaléa has been bringing beauty and joy to our
            community through the art of floristry. From a small passion
            project to a beloved local flower shop.
          </p>
        </div>

        <div className="about-card">
          <span className="about-icon">💐</span>
          <h3>Our Mission</h3>
          <p>
            We believe flowers have the power to transform moments into
            memories. Each arrangement is crafted with love and attention
            to detail to make every customer feel special.
          </p>
        </div>

        <div className="about-card">
          <span className="about-icon">✨</span>
          <h3>Our Promise</h3>
          <p>
            Fresh flowers sourced daily, expert florists with years of
            experience, same-day delivery available, and 100% satisfaction
            guarantee on all products.
          </p>
        </div>
      </div>
    </section>
  );
}
