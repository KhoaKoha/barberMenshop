import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  const goBooking = () => {
    navigate("/booking");
  };

  return (
    <section
      className="min-h-screen pt-20 flex items-center"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1599351431202-1e0f0137899a')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-7xl mx-auto px-10">
        <p className="gold tracking-widest uppercase mb-6">
          Đẳng cấp & phong cách
        </p>

        <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6">
          Nghệ Thuật
          <br />
          <span className="gold">Cắt Tóc Nam</span>
        </h1>

        <p className="text-gray-300 max-w-xl mb-10 leading-relaxed">
          Trải nghiệm dịch vụ cắt tóc cao cấp với đội ngũ thợ lành nghề,
          không gian sang trọng và phong cách phục vụ chuyên nghiệp nhất.
        </p>

        <button
          onClick={goBooking}
          className="
            bg-[#d4a441] text-black px-8 py-3 font-medium
            transition-all duration-300
            hover:brightness-110 hover:scale-105
            hover:shadow-[0_0_25px_rgba(212,164,65,0.6)]
          "
        >
          Đặt lịch ngay
        </button>
      </div>
    </section>
  );
}
