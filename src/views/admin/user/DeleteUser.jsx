import { Modal, ModalBody, ModalHeader, Button, Spinner } from "flowbite-react";
import { useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { supabase } from "../../../lib/supabaseClient";

export default function DeleteUser({
  openModal,
  setOpenModal,
  selectedUser,
  fetchUser, // ⬅️ Buat refresh data table
  setToast,
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  //   const handleDelete = async () => {
  //     if (!selectedUser?.id) {
  //       setToast({ type: "error", message: "User ID not found!" });
  //       return;
  //     }

  //     setIsDeleting(true);

  //     try {
  //       const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
  //         selectedUser.id_new
  //       );
  //       if (authError) throw authError;

  //       const { error } = await supabase
  //         .from("users")
  //         .delete()
  //         .eq("id", selectedUser.id);

  //       if (error) throw error;

  //       await fetchUser(); // Refresh table
  //       setToast({ type: "success", message: "User deleted successfully!" });
  //     } catch (err) {
  //       console.error(err);
  //       setToast({ type: "error", message: err.message });
  //     } finally {
  //       setIsDeleting(false);
  //       setOpenModal(false);
  //     }
  //   };

  const handleDelete = async () => {
    if (!selectedUser?.id || !selectedUser?.id_new) {
      setToast({ type: "error", message: "User ID or Auth ID not found!" });
      return;
    }

    setIsDeleting(true);

    try {
      const { data, error } = await supabase.functions.invoke("rapid-handler", {
        body: {
          id: selectedUser.id,
          id_new: selectedUser.id_new,
        },
      });

      if (error) throw error;

      await fetchUser();
      setToast({ type: "success", message: data.message });
    } catch (err) {
      console.error(err);
      setToast({
        type: "error",
        message: err.message || "Something went wrong",
      });
    } finally {
      setIsDeleting(false);
      setOpenModal(false);
    }
  };

  return (
    <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
      <ModalHeader />
      <ModalBody>
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 text-gray-400 h-14 w-14 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to delete <b>{selectedUser?.name || "-"}</b>?
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
                "Yes, I'm sure"
              )}
            </Button>
            <Button color="alternative" onClick={() => setOpenModal(false)}>
              No, cancel
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
