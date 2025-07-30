import { Outlet } from "react-router";
import PageHead from "../../commons/PageHead/PageHead";
import ThemeToggle from "../../commons/ThemeToggle";

export default function AuthLayout() {
  return (
    <>
      <PageHead title="Mycafe | Login" />
      <div className="flex items-center justify-center min-h-screen">
       
        <Outlet />
      </div>
    </>
  );
}
