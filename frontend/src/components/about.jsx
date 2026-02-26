export default function AboutSection() {
  return (
    <section className="bg-[#fff4f4] py-[80px] px-[60px] text-center" id="about">
      <h2 className="text-[36px] font-semibold text-[#111827] mb-2.5">About Petaléa</h2>
      <div className="w-20 h-1 bg-[#e11d48] mx-auto mb-[50px] rounded-[10px]"></div>

      <div className="grid grid-cols-3 gap-8 max-[900px]:grid-cols-1">
        <div className="bg-white rounded-2xl p-10 shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer hover:-translate-y-[15px] hover:scale-[1.03] hover:shadow-[0_25px_40px_rgba(0,0,0,0.15)]">
          <span className="text-[42px] block mb-4">🌸</span>
          <h3 className="text-[22px] mb-3 text-[#111827]">Our Story</h3>
          <p className="text-[15px] leading-[1.7] text-[#4b5563]">
            Founded in 2010, Petaléa has been bringing beauty and joy to our
            community through the art of floristry. From a small passion
            project to a beloved local flower shop.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-10 shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer hover:-translate-y-[15px] hover:scale-[1.03] hover:shadow-[0_25px_40px_rgba(0,0,0,0.15)]">
          <span className="text-[42px] block mb-4">💐</span>
          <h3 className="text-[22px] mb-3 text-[#111827]">Our Mission</h3>
          <p className="text-[15px] leading-[1.7] text-[#4b5563]">
            We believe flowers have the power to transform moments into
            memories. Each arrangement is crafted with love and attention
            to detail to make every customer feel special.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-10 shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer hover:-translate-y-[15px] hover:scale-[1.03] hover:shadow-[0_25px_40px_rgba(0,0,0,0.15)]">
          <span className="text-[42px] block mb-4">✨</span>
          <h3 className="text-[22px] mb-3 text-[#111827]">Our Promise</h3>
          <p className="text-[15px] leading-[1.7] text-[#4b5563]">
            Fresh flowers sourced daily, expert florists with years of
            experience, same-day delivery available, and 100% satisfaction
            guarantee on all products.
          </p>
        </div>
      </div>
    </section>
  );
}
