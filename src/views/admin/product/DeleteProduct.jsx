import { Modal, ModalBody, ModalHeader, Button, Spinner } from "flowbite-react";
import { useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { supabase } from "../../../lib/supabaseClient";

export default function DeleteProduct({
  openModalDeleteProduct,
  setOpenModalDeleteProduct,
  selectedProduct, // ⬅️ Buat refresh data table
  fetchProduct,
  setToast,
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedProduct?.id) {
      setToast({ type: "error", message: "Product ID not found!" });
      return;
    }

    setIsDeleting(true);

    try {
      // Ambil gambar yang ingin dihapus
      const imageUrl = selectedProduct.image_url; // pastikan kolom ini sesuai dengan yang di database
      const filePath = imageUrl?.split(
        "/storage/v1/object/public/mycafestorage/"
      )[1]; // ambil path relatifnya

      // 1. Hapus data produk dari table
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", selectedProduct.id);

      if (deleteError) throw deleteError;

      // 2. Hapus gambar dari Supabase Storage (jika ada)
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from("mycafestorage")
          .remove([filePath]);

        if (storageError) {
          // Gagal hapus gambar, tapi tetap lanjut
          console.warn("Gagal hapus gambar:", storageError.message);
        }
      }

      await fetchProduct(); // refresh table
      setToast({ type: "success", message: "Product deleted successfully!" });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: err.message });
    } finally {
      setIsDeleting(false);
      setOpenModalDeleteProduct(false);
    }
  };

  return (
    <Modal
      show={openModalDeleteProduct}
      size="md"
      onClose={() => setOpenModalDeleteProduct(false)}
      popup
    >
      <ModalHeader />
      <ModalBody>
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 text-gray-400 h-14 w-14 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <b>{selectedProduct?.name || "-"}</b>?
          </h3>
          <div className="flex justify-center gap-4">
            <Button
              color="red"
              onClick={handleDelete}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Spinner size="sm" light /> Deleting...
                </>
              ) : (
                "Yes"
              )}
            </Button>
            <Button
              color="alternative"
              onClick={() => setOpenModalDeleteProduct(false)}
            >
              cancel
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
