import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Admin from "./pages/admin/Admin";
import BookingPage from "./pages/Booking";

export default function App() {
  const location = useLocation();

  // Ẩn footer ở trang auth + admin
  const hideFooter =
    location.pathname === "/register" ||
    location.pathname === "/login" ||
    location.pathname.startsWith("/admin");

  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/verify-email" element={<BookingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* 🔐 Trang quản trị (CHỈ ADMIN) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Routes>

      {!hideFooter && <Footer />}
    </>
  );
}
