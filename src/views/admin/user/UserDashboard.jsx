/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import DataTable from "../../../components/commons/table/Table";
import { supabase } from "../../../lib/supabaseClient";
import { CiUser } from "react-icons/ci";
import { Button, FloatingLabel, Label, Select, Spinner } from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PageHead from "../../../components/commons/PageHead/PageHead";
import Toaster from "../../../components/commons/toast/toaster";
import EditUser from "./EditUser";
import DeleteUser from "./DeleteUser";

export default function UserDashboard() {
  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const fetchUser = async () => {
    setIsFetching(true);
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, error } = await supabase
      .from("users")
      .select("id, id_new, name, email, role")
      .range(from, to);

    if (error) console.log("Fetch error:", error);
    else setData(data);

    const { count, error: countError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (countError) console.error("Count error:", countError);
    else setTotalItems(count);
    setIsFetching(false);
  };

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const from = (currentPage - 1) * itemsPerPage;
  //     const to = from + itemsPerPage - 1;
  //     const { data, error } = await supabase
  //       .from("users")
  //       .select("name, email, role")
  //       .range(from, to);

  //     if (error) console.log("error", error);
  //     else setData(data);

  //     // 2️⃣ Ambil total count
  //     const { count, error: countError } = await supabase
  //       .from("users")
  //       .select("*", { count: "exact", head: true });

  //     if (countError) console.error("Count error:", countError);
  //     else setTotalItems(count);
  //   };

  //   fetchUser();
  // }, [supabase, currentPage]);

  useEffect(() => {
    fetchUser();
  }, [currentPage]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [editUserDrawerOpen, setEditUserDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1️⃣ Register ke Supabase Auth
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (signUpError) throw signUpError;

      const authUserId = signUpData.user?.id;

      if (!authUserId) throw new Error("Auth user ID not returned");

      // 2️⃣ Insert ke public.users
      const { error: insertError } = await supabase.from("users").insert([
        {
          name,
          role,
          email,
          id_new: authUserId, // foreign key!
        },
      ]);

      if (insertError) throw insertError;
      await fetchUser();
      setIsOpenDrawer(false);

      // Opsional: Reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole("");
      setToast({ type: "success", message: "create user berhasil!" });
    } catch (err) {
      console.error(err.message);
      setToast({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const searchTimeout = useRef(null);

  useEffect(() => {
    // Kalau kosong, fetch normal
    if (search.trim() === "") {
      fetchUser();
      return;
    }

    // Bersihkan timeout sebelumnya
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set timeout baru
    searchTimeout.current = setTimeout(async () => {
      setIsFetching(true);

      const { data, error } = await supabase
        .from("users")
        .select("id, id_new, name, email, role")
        .ilike("name", `%${search}%`);

      if (error) console.error("Search error:", error);
      else {
        setData(data);
        setTotalItems(data.length);
      }

      setIsFetching(false);
    }, 500); // 500ms debounce

    // Optional: cleanup
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [search]);

  return (
    <>
      {toast && (
        <Toaster
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <PageHead title={"Mycafe | user"} />
      <DataTable
        title={"Manage User"}
        description="Managae user mycafe"
        nameButton={"create user"}
        columns={columns} // ⬅️ WAJIB
        data={data} // ⬅️ WAJIB
        empty="No users found"
        onEdit={(row) => {
          setSelectedUser(row);
          setEditUserDrawerOpen(true);
        }}
        // onDelete={(row) => {
        //   setSelectedUser(row);
        //   setDeleteUserModalOpen(true);
        // }}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        titleIcon={CiUser}
        titleDrawer={"Create user"}
        isOpenDrawer={isOpenDrawer}
        setIsOpenDrawer={setIsOpenDrawer}
        isFetching={isFetching}
        search={search}
        setSearch={setSearch}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FloatingLabel
            variant="outlined"
            label="Name"
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <FloatingLabel
            variant="outlined"
            label="Email"
            id="email"
            name="email"
            type="email"
            placeholder="email@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="relative">
            <FloatingLabel
              variant="outlined"
              label="Password"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 flex items-center cursor-pointer right-3"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <Label htmlFor="role" className="block mb-2">
            Role
          </Label>
          <Select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">-- Pilih Role --</option>
            <option value="admin">Admin</option>
            <option value="kasir">Kasir</option>
          </Select>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" light />
                Loading...
              </div>
            ) : (
              "Create user"
            )}
          </Button>
        </form>
      </DataTable>
      <EditUser
        isOpenDrawer={editUserDrawerOpen}
        setIsOpenDrawer={setEditUserDrawerOpen}
        selectedUser={selectedUser}
        fetchUser={fetchUser}
        setToast={setToast}
        titleDrawer="Edit User"
        titleIcon={CiUser}
      />

      {/* <DeleteUser
        openModal={deleteUserModalOpen}
        setOpenModal={setDeleteUserModalOpen}
        selectedUser={selectedUser}
        fetchUser={fetchUser}
        setToast={setToast}
      /> */}
    </>
  );
}
