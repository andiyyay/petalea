function Banner() {
  return (
    <section className="py-[60px] px-5 flex justify-center">
      <div className="bg-[#fff1f2] w-full max-w-[1200px] py-[70px] px-10 rounded-3xl text-center">
        <h2 className="text-[36px] mb-5 text-[#111827]">Same-Day Pick-up Available</h2>
        <p className="max-w-[700px] mx-auto mb-10 text-base leading-relaxed text-[#4b5563]">
          Order before 2 PM for same-day delivery in the local area.
          We ensure your flowers arrive fresh and beautiful.
        </p>
        <button className="bg-[#e11d48] text-white border-none py-3.5 px-9 rounded-xl text-base cursor-pointer hover:bg-[#be123c] hover:-translate-y-0.5 transition-all duration-300">
          Learn More
        </button>
      </div>
    </section>
  );
}

export default Banner;
