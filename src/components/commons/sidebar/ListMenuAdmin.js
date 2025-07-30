import { BiMoneyWithdraw } from "react-icons/bi";
import { CiBoxList } from "react-icons/ci";
import { FaReceipt, FaUserFriends } from "react-icons/fa";
import { IoFastFood } from "react-icons/io5";
import {
  MdDashboardCustomize,
  MdOutlinePayments,
  MdOutlineProductionQuantityLimits,
} from "react-icons/md";

export const MenuAdmin = [
  {
    name: "Dashboard",
    icon: MdDashboardCustomize,
    href: "/admin/dashboard",
  },
  {
    name: "User",
    icon: FaUserFriends,
    href: "/admin/user",
  },
  {
    name: "Category",
    icon: CiBoxList,
    href: "/admin/categories",
  },
  {
    name: "Product",
    icon: MdOutlineProductionQuantityLimits,
    href: "/admin/products",
  },
  {
    name: "Transactions",
    icon: MdOutlinePayments,
    href: "/admin/transactions",
  },
  {
    name: "Sell cashier",
    icon: IoFastFood,
    href: "/admin/cashier",
  },
];

export const MenuKasir = [
  {
    name: "Dashboard",
    icon: MdDashboardCustomize,
    href: "/kasir/dashboard",
  },
  {
    name: "Transactions",
    icon: BiMoneyWithdraw,
    href: "/kasir/transactions",
  },
  {
    name: "Sell cashier",
    icon: IoFastFood,
    href: "/kasir/menu/cashier",
  },
];
