function Hero() {
  return (
    <section
      className="h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/hero.png')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/35"></div>

      <div className="relative z-10 h-full text-white flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-[58px] leading-tight mb-4">
          Fresh Flowers, Delivered <br /> Daily
        </h1>
        <p className="text-2xl mb-7">Hand-picked arrangements for every occasion</p>
        <button className="px-9 py-3.5 bg-[#e91e63] text-white border-none rounded-md text-base cursor-pointer hover:bg-[#d81b60] transition-colors duration-300">
          <a href="#shop" className="text-white no-underline">Shop Now</a>
        </button>
      </div>
    </section>
  );
}

export default Hero;
