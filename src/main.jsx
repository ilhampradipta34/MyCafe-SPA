import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Login from "./components/login/Login.jsx";
import AuthLayout from "./components/layout/Autrh/AuthLayout.jsx";
import PublicOnlyRoute from "./components/Auth/PublicRoute.jsx";
import ProtectedRoute from "./components/Auth/ProtectedRoute.jsx";
import AdminDashboard from "./views/admin/AdminDashboard.jsx";
import KasirDashboard from "./views/kasir/KasirDashboard.jsx";
import AuthProvider from "./components/context/AuthProvider.jsx";
import SidebarLayout from "./components/layout/Dashboard/SidebarLayout.jsx";
import UserDashboard from "./views/admin/user/UserDashboard.jsx";
import CategoriesDashboard from "./views/admin/categories/Categories.jsx";
import ProductsDashboard from "./views/admin/product/products.jsx";
import TransDashboard from "./views/admin/transactions/TransDashboard.jsx";
import CashierAdmin from "./views/admin/cashier/Cashier.jsx";
import NavbarCashier from "./components/layout/Dashboard/admin/Navbar.jsx";
import KasirTransDashboard from "./views/kasir/transactionsKasir/KasirTransDashboard.jsx";
import CashierKasir from "./views/kasir/cashier/Cashier.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route index element={<Login />} />
            <Route path="/login" element={<Login />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<SidebarLayout type="admin" />}>
            <Route
              index
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route index path="/admin/dashboard" element={<AdminDashboard />} />
            <Route index path="/admin/user" element={<UserDashboard />} />
            <Route path="/admin/categories" element={<CategoriesDashboard />} />
            <Route path="/admin/products" element={<ProductsDashboard />} />
            <Route path="/admin/transactions" element={<TransDashboard />} />
            {/* Tambah halaman admin lain di sini */}
          </Route>
          <Route element={<NavbarCashier type="admin" />}>
            <Route index path="/admin/cashier" element={<CashierAdmin />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["kasir"]} />}>
          <Route element={<SidebarLayout type="kasir" />}>
            <Route
              index
              path="/kasir"
              element={<Navigate to="/kasir/dashboard" replace />}
            />
            <Route path="/kasir/dashboard" element={<KasirDashboard />} />
            <Route
              path="/kasir/transactions"
              element={<KasirTransDashboard />}
            />
          </Route>
          <Route element={<NavbarCashier type="kasir" />}>
            <Route
              index
              path="/kasir/menu/cashier"
              element={<CashierKasir />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
