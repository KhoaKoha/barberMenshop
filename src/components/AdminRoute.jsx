import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const isLogin = localStorage.getItem("isLogin") === "true";
  const role = localStorage.getItem("userRole");

  if (!isLogin || role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
