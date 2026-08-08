import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

export default function AppLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ink">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
