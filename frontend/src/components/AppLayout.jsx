import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import { isAuthenticated } from "../services/auth.js";

export default function AppLayout() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ink">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
