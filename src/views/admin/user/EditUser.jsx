import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerItems,
  FloatingLabel,
  Label,
  Select,
  Spinner,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function EditUser({
  titleDrawer,
  titleIcon,
  isOpenDrawer,
  setIsOpenDrawer,
  selectedUser, // ⬅️ Data user yang dipilih
  fetchUser, // ⬅️ Buat refresh data table
  setToast,
}) {
  const handleClose = () => setIsOpenDrawer(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [showPassword, setShowPassword] = useState();
  const [updatePassword, setUpdatePassword] = useState("");

  useEffect(() => {
    if (selectedUser) {
      setEditName(selectedUser.name || "");
      setEditEmail(selectedUser.email || "");
      setEditRole(selectedUser.role || "");
    }
  }, [selectedUser]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: editName,
          email: editEmail,
          role: editRole,
        })
        .eq("id", selectedUser.id); // PENTING: pakai PK

      if (updatePassword) {
        const { error: passwordError } =
          await supabase.auth.admin.updateUserById(
            selectedUser.id_new, // HARUS ID AUTH BUKAN PK table users
            { password: updatePassword }
          );
        if (passwordError) throw passwordError;
      }
      if (error) throw error;

      await fetchUser();
      setIsOpenDrawer(false);
      setToast({ type: "success", message: "User updated!" });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={isOpenDrawer} onClose={handleClose} position="right">
      <DrawerHeader title={titleDrawer} titleIcon={titleIcon} />
      <DrawerItems>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <FloatingLabel
            variant="outlined"
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <FloatingLabel
            variant="outlined"
            label="Email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            required
          />
          <div className="relative">
            <FloatingLabel
              variant="outlined"
              label="Password"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={updatePassword}
              onChange={(e) => setUpdatePassword(e.target.value)}
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
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            required
          >
            <option value="">-- Pilih Role --</option>
            <option value="admin">Admin</option>
            <option value="kasir">Kasir</option>
          </Select>
          <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" light />
                Loading...
              </div>
            ) : (
              "Edit user"
            )}
          </Button>
        </form>
      </DrawerItems>
    </Drawer>
  );
}
