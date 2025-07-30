import { Outlet } from "react-router";
import SidebarMenu from "../../commons/sidebar/Sidebar";
import ThemeToggle from "../../commons/ThemeToggle";


export default function SidebarLayout({ type }) {
  return (
    <div className="flex min-h-screen">
    
      <SidebarMenu type={type} />

      <div className="flex-1 p-4 ml-64">
      
        {/* Ini slot child, halaman di dalam dashboard */}
        <Outlet />
      </div>
    </div>
  );
}
