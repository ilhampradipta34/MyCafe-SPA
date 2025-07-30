/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import DataTable from "../../../components/commons/table/Table";
import { supabase } from "../../../lib/supabaseClient";
import { CiUser } from "react-icons/ci";
import { Button, FloatingLabel, Label, Select, Spinner } from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PageHead from "../../../components/commons/PageHead/PageHead";
import Toaster from "../../../components/commons/toast/toaster";
import EditUser from "./EditCategory";
import DeleteUser from "./DeleteCategory";
import { MdOutlineCategory } from "react-icons/md";
import { data } from "react-router";
import EditCategory from "./EditCategory";
import DeleteCategory from "./DeleteCategory";

export default function CategoriesDashboard() {
  const columns = [
    { key: "name", label: "Name" }
  ];

  const [dataCategories, setDataCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const fetchCategories = async () => {
    setIsFetching(true);
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, error } = await supabase
      .from("categories")
      .select('*')
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) console.log("Fetch error:", error);
    else setDataCategories(data);

    const { count, error: countError } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true });

    if (countError) console.error("Count error:", countError);
    else setTotalItems(count);
    setIsFetching(false);
  };

  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [editCategoryDrawerOpen, setEditCategoryDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {

      const { error: insertError } = await supabase.from("categories").insert([
        {
          name,
        },
      ]);

      if (insertError) throw insertError;
      await fetchCategories();
      setIsOpenDrawer(false);

      // Opsional: Reset form
      setName("");
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
    if (search.trim() === "") return;


    // Bersihkan timeout sebelumnya
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set timeout baru
    searchTimeout.current = setTimeout(async () => {
      setIsFetching(true);

      const { data, error } = await supabase
        .from("categories")
        .select('*')
        .ilike("name", `%${search}%`);

      if (error) console.error("Search error:", error);
      else {
        setDataCategories(data);
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

    useEffect(() => {
    fetchCategories();
  }, [currentPage, search]);

  return (
    <>
      {toast && (
        <Toaster
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <PageHead title={"Mycafe | categorie"} />
      <DataTable
        title={"Manage all categories"}
        description="Managae categories mycafe"
        nameButton={"create category"}
        columns={columns} // ⬅️ WAJIB
        data={dataCategories} // ⬅️ WAJIB
        empty="No category found"
        onEdit={(row) => {
          setSelectedCategory(row);
          setEditCategoryDrawerOpen(true);
        }}
        onDelete={(row) => {
          setSelectedCategory(row);
          setDeleteCategoryModalOpen(true);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        titleIcon={MdOutlineCategory}
        titleDrawer={"Create category"}
        isOpenDrawer={isOpenDrawer}
        setIsOpenDrawer={setIsOpenDrawer}
        isFetching={isFetching}
        search={search}
        setSearch={setSearch}
      >
        <form className="space-y-4" onSubmit={handleSubmitCategory}>
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
      <EditCategory
        isOpenDrawer={editCategoryDrawerOpen}
        setIsOpenDrawer={setEditCategoryDrawerOpen}
        selectedCategory={selectedCategory}
        fetchCategory={fetchCategories}
        setToast={setToast}
        titleDrawer="Edit category"
        titleIcon={CiUser}
      />

      <DeleteCategory
        openModal={deleteCategoryModalOpen}
        setOpenModal={setDeleteCategoryModalOpen}
        selectedCategory={selectedCategory}
        fetchCategory={fetchCategories}
        setToast={setToast}
      />
    </>
  );
}
