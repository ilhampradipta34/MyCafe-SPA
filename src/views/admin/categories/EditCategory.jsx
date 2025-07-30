import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerItems,
  FloatingLabel,
  Spinner,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";


export default function EditCategory({
  titleDrawer,
  titleIcon,
  isOpenDrawer,
  setIsOpenDrawer,
  selectedCategory, // ⬅️ Data Category yang dipilih
  fetchCategory, // ⬅️ Buat refresh data table
  setToast,
}) {
  const handleClose = () => setIsOpenDrawer(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (selectedCategory) {
      setEditName(selectedCategory.name || "");
    }
  }, [selectedCategory]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: editName,
        })
        .eq("id", selectedCategory.id); // PENTING: pakai PK


      if (error) throw error;

      await fetchCategory();
      setIsOpenDrawer(false);
      setToast({ type: "success", message: "Category updated!" });
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
          <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" light />
                Loading...
              </div>
            ) : (
              "Edit category"
            )}
          </Button>
        </form>
      </DrawerItems>
    </Drawer>
  );
}
