import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ===== VALIDATE =====
  const validate = () => {
    const err = {};

    if (!form.fullName.trim()) {
      err.fullName = "Vui lòng nhập họ và tên";
    }

    const gmailRegex = /^[a-z0-9]+(\.[a-z0-9]+)*@gmail\.com$/;
    if (!gmailRegex.test(form.email)) {
      err.email = "Email Gmail không hợp lệ (vd: tennguoidung@gmail.com)";
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*]).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      err.password =
        "Mật khẩu ≥8 ký tự, có hoa, thường, số và ký tự đặc biệt";
    }

    if (!form.confirmPassword) {
      err.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (form.password !== form.confirmPassword) {
      err.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    const phoneRegex = /^(03|07|08|09)\d{8}$/;
    if (!phoneRegex.test(form.phone)) {
      err.phone = "SĐT không hợp lệ (vd: 0901234567)";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      // Exclude confirmPassword from data sent to backend
      const { confirmPassword, ...registerData } = form;
      await axios.post("http://localhost:3001/register", registerData);

      alert("🎉 Đăng ký thành công! Vui lòng đăng nhập");

      // reset form (giữ nguyên hành vi cũ)
      setForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        gender: "",
      });
      setErrors({});

      // ✅ CHUYỂN SANG TRANG ĐĂNG NHẬP
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black pt-20">
      <form
        onSubmit={handleSubmit}
        className="w-[420px] bg-zinc-900 pt-4 pb-8 px-8 rounded-xl space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center mb-4 text-white">
          Đăng ký tài khoản
        </h2>

        <div>
          <input
            name="fullName"
            value={form.fullName}
            placeholder="Họ và tên"
            onChange={handleChange}
            className={`w-full p-3 rounded bg-black border text-white placeholder-gray-400 ${
              errors.fullName ? "border-red-500" : "border-zinc-700"
            }`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            name="email"
            value={form.email}
            placeholder="Email Gmail"
            onChange={handleChange}
            className={`w-full p-3 rounded bg-black border text-white placeholder-gray-400 ${
              errors.email ? "border-red-500" : "border-zinc-700"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <input
            name="phone"
            value={form.phone}
            placeholder="Số điện thoại"
            onChange={handleChange}
            className={`w-full p-3 rounded bg-black border text-white placeholder-gray-400 ${
              errors.phone ? "border-red-500" : "border-zinc-700"
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            name="password"
            value={form.password}
            placeholder="Mật khẩu"
            onChange={handleChange}
            className={`w-full p-3 rounded bg-black border text-white placeholder-gray-400 ${
              errors.password ? "border-red-500" : "border-zinc-700"
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            placeholder="Xác nhận mật khẩu"
            onChange={handleChange}
            className={`w-full p-3 rounded bg-black border text-white placeholder-gray-400 ${
              errors.confirmPassword ? "border-red-500" : "border-zinc-700"
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#d4a441] text-black py-3 rounded font-semibold disabled:opacity-50 hover:bg-[#c49431] transition-colors"
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>
    </div>
  );
}
