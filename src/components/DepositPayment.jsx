import { useState, useEffect } from "react";
import axios from "axios";

export default function DepositPayment({ bookingData, onBack, onComplete }) {
  const [depositAmount, setDepositAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(true);

  useEffect(() => {
    const checkVerification = async () => {
      if (bookingData?.customer?.email) {
        try {
          const response = await axios.post(
            "http://localhost:3001/api/booking/check-verification",
            { email: bookingData.customer.email }
          );
          setEmailVerified(response.data.verified);
        } catch (err) {
          console.error("Error checking verification:", err);
          setEmailVerified(false);
        } finally {
          setCheckingVerification(false);
        }
      } else {
        setCheckingVerification(false);
      }
    };

    checkVerification();

    if (bookingData) {
      const total = bookingData.price || 0;
      const deposit = Math.round(total * 0.5); // 50% deposit
      setTotalAmount(total);
      setDepositAmount(deposit);
    }
  }, [bookingData]);

  const handlePayment = async () => {
    // Validate email verification
    if (!emailVerified) {
      alert("Vui lòng xác nhận email trước khi thanh toán.");
      return;
    }

    // Double-check with backend
    try {
      const response = await axios.post(
        "http://localhost:3001/api/booking/check-verification",
        { email: bookingData.customer.email }
      );

      if (!response.data.verified) {
        alert("Email chưa được xác nhận. Vui lòng xác nhận email trước khi thanh toán.");
        return;
      }
    } catch (err) {
      alert("Lỗi khi kiểm tra trạng thái xác nhận email.");
      return;
    }

    // Placeholder for payment processing
    console.log("Processing deposit payment:", {
      depositAmount,
      totalAmount,
      bookingData,
    });

    // Simulate payment success
    alert(`Đã thanh toán cọc thành công: ${depositAmount.toLocaleString()}đ`);
    
    // Save payment info
    const paymentData = {
      ...bookingData,
      depositAmount,
      totalAmount,
      paymentStatus: "deposit_paid",
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem("paymentData", JSON.stringify(paymentData));
    
    if (onComplete) {
      onComplete();
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
          Thanh Toán <span className="gold">Cọc</span>
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
              <span className="text-gray-400">Thời lượng:</span>
              <span className="text-white font-medium">
                {bookingData.duration || 0} phút
              </span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-gray-400">Tổng chi phí:</span>
              <span className="text-white font-medium">
                {totalAmount.toLocaleString()}đ
              </span>
            </div>
          </div>
        </div>

        {/* Email Verification Status */}
        {checkingVerification ? (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-400">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-medium">Đang kiểm tra trạng thái xác nhận email...</span>
            </div>
          </div>
        ) : emailVerified ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-green-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Email đã được xác nhận</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {bookingData?.customer?.email}
            </p>
          </div>
        ) : (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Email chưa được xác nhận</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Vui lòng xác nhận email trước khi thanh toán.
            </p>
          </div>
        )}

        {/* Deposit Information */}
        <div className="bg-zinc-900 border-2 border-[#d4a441]/40 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Số tiền cọc (50%)</h3>
            <span className="text-3xl font-bold text-[#d4a441]">
              {depositAmount.toLocaleString()}đ
            </span>
          </div>
          
          <p className="text-gray-400 text-sm">
            Số tiền còn lại ({totalAmount - depositAmount}đ) sẽ thanh toán khi đến cửa hàng.
          </p>
        </div>

        {/* Payment Method Placeholder */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mb-8">
          <h3 className="text-xl font-semibold mb-6">Phương Thức Thanh Toán</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border border-zinc-700 rounded-lg cursor-pointer hover:border-[#d4a441] transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                id="banking"
                defaultChecked
                className="w-5 h-5 text-[#d4a441]"
              />
              <label htmlFor="banking" className="flex-1 cursor-pointer">
                <span className="font-medium">Chuyển khoản ngân hàng</span>
                <p className="text-sm text-gray-400 mt-1">
                  (Tính năng sẽ được tích hợp sau)
                </p>
              </label>
            </div>
            
            <div className="flex items-center gap-4 p-4 border border-zinc-700 rounded-lg cursor-pointer hover:border-[#d4a441] transition-colors opacity-50">
              <input
                type="radio"
                name="paymentMethod"
                id="cash"
                disabled
                className="w-5 h-5"
              />
              <label htmlFor="cash" className="flex-1 cursor-pointer">
                <span className="font-medium">Tiền mặt tại cửa hàng</span>
                <p className="text-sm text-gray-400 mt-1">
                  (Sẽ có sau)
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-4 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-medium"
          >
            Quay lại
          </button>
          <button
            onClick={handlePayment}
            disabled={!emailVerified || checkingVerification}
            className={`flex-1 px-6 py-4 rounded-lg transition-colors font-semibold text-lg ${
              emailVerified && !checkingVerification
                ? "bg-[#d4a441] text-black hover:bg-[#c49431]"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {checkingVerification
              ? "Đang kiểm tra..."
              : emailVerified
              ? "Thanh Toán Cọc"
              : "Vui lòng xác nhận email"}
          </button>
        </div>
      </div>
    </section>
  );
}
