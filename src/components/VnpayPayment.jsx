import { useState } from "react";
import axios from "axios";

export default function VnpayPayment({ bookingData, onBack, onSuccess, onFailure }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [bankCode, setBankCode] = useState("");

  const handleVnpayPayment = async () => {
    setProcessing(true);
    setError(null);

    if (!bookingData || !bookingData.price || !bookingData.customer) {
      setError("Thông tin đặt lịch hoặc giá tiền không hợp lệ.");
      setProcessing(false);
      return;
    }

    if (!bankCode) {
      setError("Vui lòng chọn phương thức thanh toán / ngân hàng.");
      setProcessing(false);
      return;
    }

    // Ensure we have appointmentId (from state or localStorage) so vnp_TxnRef maps to Appointments.Id
    const appointmentId = bookingData.appointmentId ?? (() => {
      try {
        const saved = localStorage.getItem("bookingData");
        return saved ? JSON.parse(saved).appointmentId : undefined;
      } catch {
        return undefined;
      }
    })();

    if (!appointmentId) {
      setError("Không tìm thấy mã đặt lịch. Vui lòng quay lại bước trước và thử lại.");
      setProcessing(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/api/vnpay/create_payment_url", {
        amount: bookingData.price,
        appointmentId,
        orderDescription: `Thanh toán cho lịch hẹn mã ${appointmentId}`,
        orderType: "billpayment", // You can customize this
        language: "vn", // or "en"
        bankCode: bankCode,
      });

      if (response.data && response.data.vnpUrl) {
        window.location.href = response.data.vnpUrl;
      } else {
        throw new Error("Không nhận được URL thanh toán từ VNPAY.");
      }
    } catch (err) {
      console.error("Error initiating VNPAY payment:", err);
      setProcessing(false);
      setError(err.response?.data?.message || "Lỗi khi tạo yêu cầu thanh toán VNPAY.");
      if (onFailure) {
        onFailure(err.response?.data?.message || "Lỗi khi tạo yêu cầu thanh toán VNPAY.");
      }
    }
  };

  if (!bookingData) {
    return (
      <div className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-10 text-center">
          <p className="text-red-400">Không tìm thấy thông tin đặt lịch. Vui lòng quay lại bước trước.</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-[#d4a441] text-black rounded hover:bg-[#c49431]"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-4xl mx-auto px-10">
        <h2 className="text-3xl font-bold mb-8">
          Thanh Toán <span className="gold">VNPAY</span>
        </h2>

        {/* Booking Summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mb-8">
          <h3 className="text-xl font-semibold mb-6 text-[#d4a441]">
            Thông Tin Đặt Lịch
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-gray-400">Dịch vụ:</span>
              <span className="text-white font-medium">
                {bookingData.services?.join(", ") || "---"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-gray-400">Ngày:</span>
              <span className="text-white font-medium">
                {bookingData.date || "---"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-gray-400">Giờ:</span>
              <span className="text-white font-medium">
                {bookingData.time || "---"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-gray-400">Tổng chi phí:</span>
              <span className="text-white font-medium">
                {bookingData.price?.toLocaleString() || 0}đ
              </span>
            </div>
          </div>
        </div>

        {/* Chọn phương thức / ngân hàng thanh toán */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mb-6">
          <h3 className="text-xl font-semibold mb-4">Chọn phương thức thanh toán</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="bankCode"
                value="VNPAYQR"
                checked={bankCode === "VNPAYQR"}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-4 h-4 text-[#d4a441]"
              />
              <div>
                <p className="font-medium">Quét mã QR (VNPAYQR)</p>
                <p className="text-sm text-gray-400">
                  Thanh toán bằng ứng dụng ngân hàng / ví điện tử hỗ trợ VNPAYQR.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="bankCode"
                value="VNBANK"
                checked={bankCode === "VNBANK"}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-4 h-4 text-[#d4a441]"
              />
              <div>
                <p className="font-medium">Thẻ ATM / Tài khoản nội địa (VNBANK)</p>
                <p className="text-sm text-gray-400">
                  Thanh toán bằng thẻ ATM hoặc tài khoản ngân hàng nội địa.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="bankCode"
                value="INTCARD"
                checked={bankCode === "INTCARD"}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-4 h-4 text-[#d4a441]"
              />
              <div>
                <p className="font-medium">Thẻ quốc tế (INTCARD)</p>
                <p className="text-sm text-gray-400">
                  Thanh toán bằng thẻ Visa, Mastercard, JCB, American Express.
                </p>
              </div>
            </label>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-center mt-2">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-4 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-medium"
            disabled={processing}
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={handleVnpayPayment}
            className={`flex-1 px-6 py-4 rounded-lg transition-colors font-semibold text-lg ${
              processing
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-[#d4a441] text-black hover:bg-[#c49431]"
            }`}
            disabled={processing}
          >
            {processing ? "Đang chuyển hướng VNPAY..." : "Tiến hành Thanh Toán VNPAY"}
          </button>
        </div>
      </div>
    </section>
  );
}
