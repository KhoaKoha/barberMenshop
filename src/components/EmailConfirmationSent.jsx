export default function EmailConfirmationSent({ customerEmail }) {
  return (
    <section className="py-20 bg-black text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          {/* Email Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-[#d4a441]/20 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-[#d4a441]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold mb-4">
            Vui lòng kiểm tra email để xác nhận đặt lịch
          </h2>

          {/* Message */}
          <p className="text-gray-300 text-lg mb-6">
            Chúng tôi đã gửi email xác nhận đến địa chỉ:
          </p>
          <p className="text-[#d4a441] font-semibold text-xl mb-8">
            {customerEmail}
          </p>

          {/* Instructions */}
          <div className="bg-black/50 border border-zinc-700 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold mb-4 text-[#d4a441]">
              Hướng dẫn:
            </h3>
            <ol className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-[#d4a441] font-bold">1.</span>
                <span>
                  Kiểm tra hộp thư đến (Inbox) và thư mục Spam/Junk của email
                  trên
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#d4a441] font-bold">2.</span>
                <span>
                  Mở email từ MenZone Barbershop và nhấp vào nút "Xác nhận đặt
                  lịch"
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#d4a441] font-bold">3.</span>
                <span>
                  Đặt lịch của bạn sẽ được xác nhận sau khi bạn nhấp vào liên
                  kết trong email
                </span>
              </li>
            </ol>
          </div>

          {/* Note */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8">
            <p className="text-yellow-400 text-sm">
              <strong>Lưu ý:</strong> Đặt lịch chỉ được xác nhận sau khi bạn
              nhấp vào liên kết trong email. Nếu không nhận được email trong
              vòng vài phút, vui lòng kiểm tra thư mục Spam hoặc liên hệ với
              chúng tôi.
            </p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => window.location.href = "/"}
            className="px-8 py-3 bg-[#d4a441] text-black rounded-lg hover:bg-[#c49431] transition-colors font-semibold"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </section>
  );
}
