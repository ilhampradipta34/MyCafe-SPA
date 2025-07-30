import {
  Avatar,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Spinner,
  TextInput,
} from "flowbite-react";
import { IoChevronBackCircle } from "react-icons/io5";
import { Link, Outlet } from "react-router";
import useNavbar from "./useNavbar";
import { Signal } from "lucide-react";
import { MdSignalWifi4Bar } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { useState } from "react";
import { IoIosClose } from "react-icons/io";

export default function NavbarCashier() {
  const bg_url = "/src/assets/images/bg2.jpg";
  const [search, setSearch] = useState("");
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const { loading, userProfile, handleSignout, isOnline } = useNavbar();

  return (
    <>
      <div
        className="min-h-screen bg-center bg-cover"
        style={{ backgroundImage: `url(${bg_url})` }}
      >
        <div className="grid grid-cols-3 p-4 mx-4">
          <div className="flex items-center gap-x-4">
            <Link to={"/admin/dashboard"}>
              <IoChevronBackCircle size={25} color="white" />
            </Link>
            <p className="text-xl font-bold text-white">MyCafe</p>
          </div>

          <div className="relative flex justify-center">
            <TextInput
              type="text"
              icon={CiSearch}
              placeholder="Search..."
              className="w-full max-w-md px-3 py-2 text-sm rounded-lg"
              color="white"
              value={search}
              onChange={handleSearchChange}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute text-gray-400 -translate-y-1/2 cursor-pointer right-3 top-1/2 hover:text-gray-600"
              >
                <IoIosClose size={20} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <div className="flex flex-col items-center">
              <MdSignalWifi4Bar
                size={20}
                className={isOnline ? "text-green-400" : "text-gray-400"}
              />
              <p className="text-xs text-gray-50">
                {isOnline ? "connected" : "disconnected"}
              </p>
            </div>
            <Dropdown
              className="cursor-pointer"
              arrowIcon={false}
              inline
              label={
                <Avatar
                  alt="User settings"
                  img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                  className="cursor-pointer"
                  rounded
                  bordered
                />
              }
            >
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Spinner size="sm" />
                </div>
              ) : (
                <DropdownHeader>
                  <span className="block text-sm">
                    {userProfile?.name} - {userProfile?.role}
                  </span>
                </DropdownHeader>
              )}
              <DropdownDivider />
              <Link to={"admin/dashboard"}>
                <DropdownItem>Dashboard</DropdownItem>
              </Link>
              <DropdownDivider />
              <DropdownItem onClick={handleSignout}>Sign out</DropdownItem>
            </Dropdown>
          </div>
        </div>
        <div className="px-4 mx-4">
          <Outlet context={{ search }} />
        </div>
      </div>
    </>
  );
}
