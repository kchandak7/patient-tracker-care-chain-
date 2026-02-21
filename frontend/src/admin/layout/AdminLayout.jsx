import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen bg-[#f0f4f8] font-sans flex overflow-hidden">
      {/* Sidebar — collapsible */}
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content — scrollable, adjusts to sidebar width */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 transition-all duration-300">
        <AdminTopbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 px-6 py-6 overflow-y-auto admin-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;