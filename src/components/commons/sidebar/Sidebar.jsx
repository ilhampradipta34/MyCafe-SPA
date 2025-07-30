import {
  Button,
  HR,
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
  SidebarLogo,
} from "flowbite-react";
import { MenuAdmin, MenuKasir } from "./ListMenuAdmin";
import { Link, useLocation, useNavigate } from "react-router";
import { supabase } from "../../../lib/supabaseClient";
import { CiLogout } from "react-icons/ci";
import { cn } from "../../../utils/cn";
export default function SidebarMenu({ type = "admin" }) {
  const items = type === "kasir" ? MenuKasir : MenuAdmin;
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("forceRole"); // hapus cache role juga
    navigate("/login"); // redirect ke login page
  };

  return (
    <Sidebar
      aria-label="Sidebar with logo branding"
      className="fixed top-0 left-0 w-64 h-screen [&_*]:bg-white [&_*]:text-black"
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <SidebarLogo
            href="/admin/dashboard"
            img="/src/assets/images/logo.png"
            imgAlt="Mycafe logo"
            className=""
          >
            Mycafe - {type}
          </SidebarLogo>
          <SidebarItems>
            <SidebarItemGroup>
              {items.map((item) => {
                const isActive = location.pathname === item.href;

                return (
                  <SidebarItem
                    key={item.href}
                    as={Link} // Gunakan React Router Link
                    to={item.href} // Tujuan navigasi
                    icon={item.icon}
                    className={cn(
                      "p-4 hover:border hover:border-black hover:!bg-transparent",
                      isActive && "shadow-lg rounded-md ring-1 ring-gray-200"
                    )}
                  >
                    {item.name}
                  </SidebarItem>
                );
              })}
            </SidebarItemGroup>
          </SidebarItems>
        </div>
        <HR className="mt-10 !bg-gray-300" />
        <div className="p-4">
          <Button
            color="failure"
            className="flex items-center p-2 justify-start w-full px-4 cursor-pointer gap-x-4 hover:border hover:border-black hover:!bg-transparent"
            onClick={handleSignout}
          >
            <CiLogout className="-ml-4 text-xl text-white" />
            <span className="text-white">Sign Out</span>
          </Button>
        </div>
      </div>
    </Sidebar>
  );
}
