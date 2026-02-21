import { useState } from "react";
import { Outlet } from "react-router-dom";
import NurseSidebar from "./NurseSidebar";
import NurseTopbar from "./NurseTopbar";

const NurseLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <NurseSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col">
        <NurseTopbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="flex-1 p-6 overflow-y-auto admin-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default NurseLayout;
