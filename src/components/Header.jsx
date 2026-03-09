import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Toast from "./ui/Toast";

const HEADER_HEIGHT = 80;

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [active, setActive] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(""); // ⭐ THÊM ROLE
  const [showToast, setShowToast] = useState(false);

  // ===== LOGIN STATE =====
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLogin") === "true";
    setIsLogin(loggedIn);
    setEmail(loggedIn ? localStorage.getItem("userEmail") || "" : "");
    setRole(loggedIn ? localStorage.getItem("userRole") || "" : "");
  }, [location.pathname]);

  // ===== ACTIVE MENU THEO ROUTE =====
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) setActive("admin");
    else if (location.pathname === "/booking") setActive("booking");
    else if (location.pathname === "/register") setActive("register");
    else if (location.pathname === "/login") setActive("login");
    else if (location.pathname === "/") setActive("home");
  }, [location.pathname]);

  // ===== SCROLL ACTIVE (CHỈ TRANG HOME) =====
  useEffect(() => {
    if (location.pathname !== "/") return;

    const onScroll = () => {
      const sections = ["home", "services", "appointments", "booking"];
      for (let id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        if (
          rect.top <= HEADER_HEIGHT + 20 &&
          rect.bottom >= HEADER_HEIGHT + 20
        ) {
          setActive(id);
          break;
        }
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  // ===== SCROLL CÓ OFFSET =====
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const y =
      el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;

    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // ===== ĐIỀU HƯỚNG CHUẨN =====
  const goToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollToSection(id), 200);
    } else {
      scrollToSection(id);
    }
  };

  // ===== LOGOUT =====
  const handleLogout = () => {
    localStorage.clear();
    setIsLogin(false);
    setEmail("");
    setRole("");

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);

    navigate("/");
  };

  // ===== STYLE =====
  const menuClass = (id) =>
    `relative cursor-pointer select-none transition-all duration-300 ${
      active === id
        ? "text-[#d4a441] font-semibold"
        : "text-gray-300 hover:text-[#d4a441]"
    }`;

  const underlineClass = (id) =>
    `absolute -bottom-1 left-0 h-[2px] bg-[#d4a441] transition-all duration-300 ${
      active === id ? "w-full opacity-100" : "w-0 opacity-0"
    }`;

  return (
    <>
      <Toast show={showToast} message="Đăng xuất thành công" />

      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto h-20 px-10 flex items-center justify-between">

          {/* LOGO */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 font-semibold tracking-widest cursor-pointer"
          >
            <span className="text-lg">
              MEN<span className="gold">ZONE</span>
            </span>
            <span className="text-sm tracking-[0.3em] text-gray-400">
              BARBERSHOP
            </span>
          </div>

          {/* MENU */}
          <nav className="hidden md:flex gap-10 text-sm tracking-widest">

            <span
              onClick={() => goToSection("home")}
              className={menuClass("home")}
            >
              TRANG CHỦ
              <span className={underlineClass("home")} />
            </span>

            <span
              onClick={() => goToSection("services")}
              className={menuClass("services")}
            >
              DỊCH VỤ
              <span className={underlineClass("services")} />
            </span>

            <span
              onClick={() => goToSection("appointments")}
              className={menuClass("appointments")}
            >
              LỊCH HẸN
              <span className={underlineClass("appointments")} />
            </span>

            <span
              onClick={() => goToSection("booking")}
              className={menuClass("booking")}
            >
              ĐẶT LỊCH
              <span className={underlineClass("booking")} />
            </span>

            {/* 🔐 CHỈ ADMIN MỚI THẤY */}
            {isLogin && role === "admin" && (
              <Link to="/admin" className={menuClass("admin")}>
                QUẢN TRỊ
                <span className={underlineClass("admin")} />
              </Link>
            )}
          </nav>

          {/* USER */}
          <div className="flex items-center gap-4 text-sm">

            <div
              onClick={() => !isLogin && navigate("/login")}
              className="cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isLogin ? "#d4a441" : "#ffffff"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: isLogin
                    ? "drop-shadow(0 0 6px rgba(212,164,65,0.8))"
                    : "none",
                }}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            {!isLogin ? (
              <>
                <Link to="/login" className={menuClass("login")}>
                  Đăng nhập
                  <span className={underlineClass("login")} />
                </Link>
                <Link to="/register" className={menuClass("register")}>
                  Đăng ký
                  <span className={underlineClass("register")} />
                </Link>
              </>
            ) : (
              <div className="flex flex-col text-right">
                <span className="text-xs text-gray-300">{email}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-400 hover:underline"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
