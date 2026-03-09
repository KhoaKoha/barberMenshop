import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:3001/login", form);

      // ✅ LƯU TRẠNG THÁI LOGIN + ROLE
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("userEmail", res.data.email);
      localStorage.setItem("userFullName", res.data.fullName || "");
      localStorage.setItem("userRole", res.data.role); // ⭐ QUAN TRỌNG
      localStorage.setItem("userId", res.data.id);

      alert("🎉 Đăng nhập thành công");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black pt-20">
      <form
        onSubmit={handleSubmit}
        className="w-[420px] bg-zinc-900 p-8 rounded-xl space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center mb-4 text-white">
          Đăng nhập
        </h2>

        <div>
          <input
            type="email"
            name="email"
            value={form.email}
            placeholder="Email Gmail"
            onChange={handleChange}
            className="w-full p-3 rounded bg-black border border-zinc-700 text-white placeholder-gray-400 focus:border-[#d4a441] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <input
            type="password"
            name="password"
            value={form.password}
            placeholder="Mật khẩu"
            onChange={handleChange}
            className="w-full p-3 rounded bg-black border border-zinc-700 text-white placeholder-gray-400 focus:border-[#d4a441] focus:outline-none transition-colors"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded p-3">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#d4a441] text-black py-3 rounded font-semibold disabled:opacity-50 hover:bg-[#c49431] transition-colors"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>

        <div className="text-center pt-2">
          <p className="text-gray-400 text-sm">
            Chưa có tài khoản?{" "}
            <a
              href="/register"
              className="text-[#d4a441] hover:underline font-medium"
            >
              Đăng ký ngay
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
