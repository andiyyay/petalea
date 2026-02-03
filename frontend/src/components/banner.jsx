import "./banner.css";

function Banner() {
  return (
    <section className="delivery-wrapper">
      <div className="delivery-card">
        <h2>Same-Day Pick-up Available</h2>
        <p>
          Order before 2 PM for same-day delivery in the local area.
          We ensure your flowers arrive fresh and beautiful.
        </p>
        <button className="delivery-btn">Learn More</button>
      </div>
    </section>
  );
}

export default Banner;
