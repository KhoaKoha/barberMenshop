import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function EmailVerification({
  email,
  verificationLink,
  onVerified,
  onResend,
}) {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("pending"); // 'pending', 'verifying', 'verified', 'error'
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);

  // Check if user came from email link
  useEffect(() => {
    const token = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (token && emailParam) {
      const fn = async () => {
        await verifyEmail(token, emailParam);
      };
      fn();
    } else if (email) {
      // If email is provided but no token, show pending status
      setStatus("pending");
      
      // If logged-in user and no verificationLink, automatically send email
      if (!verificationLink && onResend) {
        // Small delay to ensure component is fully mounted
        setTimeout(() => {
          onResend();
        }, 100);
      }
    }
  }, [searchParams, email, verificationLink, onResend]);

  const verifyEmail = async (token, emailToVerify) => {
    try {
      setStatus("verifying");
      setMessage("Đang xác nhận email...");

      const response = await axios.post(
        "http://localhost:3001/api/booking/verify-email",
        {
          token,
          email: emailToVerify,
        }
      );

      if (response.data.verified) {
        setStatus("verified");
        setMessage("Email đã được xác nhận thành công!");
        localStorage.setItem("emailVerified", "true");
        localStorage.setItem("emailToVerify", emailToVerify);

        // Callback to parent
        if (onVerified) {
          setTimeout(() => {
            onVerified();
          }, 1500);
        }
      }
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.message || "Lỗi khi xác nhận email. Vui lòng thử lại."
      );
      console.error("Error verifying email:", err);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      if (onResend) {
        await onResend();
        setMessage("Đã gửi lại email xác nhận!");
      }
    } catch (err) {
      setMessage("Lỗi khi gửi lại email. Vui lòng thử lại.");
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-2xl mx-auto px-10">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Xác Nhận <span className="gold">Email</span>
        </h2>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          {status === "pending" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500/50 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-yellow-400 animate-pulse"
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

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Vui lòng kiểm tra email của bạn
                </h3>
                <p className="text-gray-400 mb-4">
                  Chúng tôi đã gửi email xác nhận đến:
                </p>
                <p className="text-[#d4a441] font-medium text-lg mb-6">
                  {email}
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Nhấp vào liên kết trong email để xác nhận địa chỉ email của bạn.
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  <strong>Lưu ý:</strong> Nếu không thấy email, vui lòng kiểm tra thư mục spam.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  {resending ? "Đang gửi..." : "Gửi lại email"}
                </button>
              </div>
            </div>
          )}

          {status === "verifying" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center animate-spin">
                  <svg
                    className="w-8 h-8 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-gray-400">{message}</p>
            </div>
          )}

          {status === "verified" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-green-400">
                {message}
              </h3>
              <p className="text-gray-400 text-sm">
                Đang chuyển đến bước thanh toán...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-red-400">
                Xác nhận thất bại
              </h3>
              <p className="text-gray-400">{message}</p>
              <button
                onClick={handleResend}
                disabled={resending}
                className="px-6 py-2 bg-[#d4a441] text-black rounded-lg hover:bg-[#c49431] transition-colors disabled:opacity-50"
              >
                {resending ? "Đang gửi..." : "Gửi lại email"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
