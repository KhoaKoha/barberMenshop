import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="pt-24 min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center ring-4 ring-emerald-500/30">
            <svg
              className="w-12 h-12 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-emerald-400">
          Giao dịch hoàn tất
        </h1>
        <p className="text-gray-400 mb-8">
          Thanh toán của bạn đã được xử lý thành công. Lịch hẹn đã được xác nhận.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 px-6 bg-[#d4a441] text-black font-semibold rounded-lg hover:bg-[#c49431] transition-colors"
          >
            Về trang chủ
          </button>
          <button
            onClick={() => {
              navigate("/");
              setTimeout(() => {
                document.getElementById("appointments")?.scrollIntoView({ behavior: "smooth" });
              }, 300);
            }}
            className="w-full py-3 px-6 bg-zinc-800 text-gray-300 font-medium rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Xem lịch hẹn của tôi
          </button>
        </div>
      </div>
    </div>
  );
}
