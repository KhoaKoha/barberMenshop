import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Booking from "../components/Booking";
import MyAppointments from "../components/MyAppointments";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <section id="home">
        <Hero />
      </section>

      <section id="services">
        <Services />
      </section>

      <section id="appointments">
        <MyAppointments />
      </section>

      <section id="booking">
        <div className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-10 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Đặt Lịch <span className="gold">Ngay</span>
            </h2>
            <p className="text-gray-400 mb-8">
              Chọn dịch vụ, ngày và giờ phù hợp để chúng tôi phục vụ bạn tốt nhất.
            </p>
            <button
              onClick={() => navigate("/booking")}
              className="px-8 py-4 bg-[#d4a441] text-black font-semibold tracking-widest hover:brightness-110 transition"
            >
              ĐẶT LỊCH NGAY
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
