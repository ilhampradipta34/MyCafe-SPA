/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import DataTable from "../../../components/commons/table/Table";
import { supabase } from "../../../lib/supabaseClient";
import {
  Button,
  FileInput,
  FloatingLabel,
  Label,
  Select,
  Spinner,
} from "flowbite-react";
import PageHead from "../../../components/commons/PageHead/PageHead";
import Toaster from "../../../components/commons/toast/toaster";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { useDebounce } from "react-use";
import EditProduct from "./EditProduct";
import DeleteProduct from "./DeleteProduct";

export default function ProductsDashboard() {
  // Format ke Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const [dataProducts, setDataProducts] = useState([]);
  const [dataCategories, setDataCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [priceValue, setPriceValue] = useState(0);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const fetchProducts = async () => {
    setIsFetching(true);
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) console.log("Fetch error:", error);
    else setDataProducts(data);

    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (countError) console.error("Count error:", countError);
    else setTotalItems(count);
    setIsFetching(false);
  };
  const fetchCategories = async () => {
    setIsFetching(true);

    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("created_at", { ascending: true });

    if (error) console.log("Fetch error:", error);
    else setDataCategories(data);
    setIsFetching(false);
  };

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [editProductDrawerOpen, setEditProductDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteProductModalOpen, setDeleteProductModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let uploadedImageUrl = imageUrl; // fallback kalau sudah ada URL

      // 1️⃣ Cek file dari input
      if (file) {
        // Buat nama unik (timestamp + nama asli)
        const fileName = `${Date.now()}-${file.name}`;

        // Upload ke bucket Storage
        const { error: uploadError } = await supabase.storage
          .from("mycafestorage") // GANTI dengan nama bucket kamu
          .upload(`product-images/${fileName}`, file);

        if (uploadError) throw uploadError;

        // Ambil URL publik
        const { data: publicUrl } = supabase.storage
          .from("mycafestorage")
          .getPublicUrl(`product-images/${fileName}`);

        uploadedImageUrl = publicUrl.publicUrl;
      }

      const { error: insertError } = await supabase.from("products").insert([
        {
          name,
          price: priceValue,
          image_url: uploadedImageUrl,
          category_id: category,
        },
      ]);

      if (insertError) throw insertError;
      await fetchProducts();
      setIsOpenDrawer(false);

      // Opsional: Reset form
      setName("");
      setImageUrl("");
      setCategory("");
      setFile(null);
      setImageUrl("");
      setPrice("");
      setToast({ type: "success", message: "create product berhasil!" });
    } catch (err) {
      console.error(err.message);
      setToast({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Buat preview URL
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl("");
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;

    // Hilangkan semua yang bukan angka
    let numericValue = value.replace(/[^0-9]/g, "");

    // Update angka murni
    setPriceValue(numericValue ? parseInt(numericValue) : 0);

    // Update tampilan input
    setPrice(formatRupiah(numericValue));
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
        .from("products")
        .select("*")
        .ilike("name", `%${search}%`);

      if (error) console.error("Search error:", error);
      else {
        setDataProducts(data);
        setTotalItems(data.length);
      }

      setIsFetching(false);
    }, 1000); // 500ms debounce

    // Optional: cleanup
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [search]);



  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, search]);

  useEffect(() => {
    if (!isOpenDrawer) {
      // Kalau Drawer ditutup, reset semua form
      setName("");
      setPrice("");
      setFile(null);
      setPreviewUrl("");
      setCategory("");
      // Kalau ada field lain, reset juga di sini
    }
  }, [isOpenDrawer]);

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <div className="flex items-center gap-x-2">
          <img
            src={row.image_url}
            alt={row.name}
            className="object-cover w-10 h-10 rounded-sm"
          />
          <h3 className="self-center">{row.name}</h3>
        </div>
      ),
    },
    { key: "price", label: "Price", render: (row) => formatRupiah(row.price) },
    {
      key: "category_id",
      label: "Category",
      render: (row) => row.categories?.name,
    },
  ];

  return (
    <>
      {toast && (
        <Toaster
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <PageHead title={"Mycafe | products"} />
      <DataTable
        title={"Manage all products"}
        description="Managae products mycafe"
        nameButton={"create product"}
        columns={columns} // ⬅️ WAJIB
        data={dataProducts} // ⬅️ WAJIB
        empty="No product found"
        onEdit={(row) => {
          setSelectedProduct(row);
          setEditProductDrawerOpen(true);
        }}
        onDelete={(row) => {
          setSelectedProduct(row);
          setDeleteProductModalOpen(true);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        titleIcon={MdOutlineProductionQuantityLimits}
        titleDrawer={"Create product"}
        isOpenDrawer={isOpenDrawer}
        setIsOpenDrawer={setIsOpenDrawer}
        isFetching={isFetching}
        search={search}
        setSearch={setSearch}
      >
        <form className="space-y-4" onSubmit={handleSubmitProduct}>
          <div className="flex items-center justify-center w-full">
            <Label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              {previewUrl ? (
                // ✅ Tampilkan preview jika sudah pilih file
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="object-contain h-full"
                />
              ) : (
                // ✅ Tampilan awal drag/drop
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG or JPG
                  </p>
                </div>
              )}

              <FileInput
                id="dropzone-file"
                name="image-url"
                className="hidden"
                onChange={handleFileChange}
              />
            </Label>
          </div>
          <Label htmlFor="name" className="block mb-2">
            Name
          </Label>
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
          <Label htmlFor="category" className="block mb-2">
            Category
          </Label>
          <Select
            id="category"
            name="category_id"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">-- Pilih Category --</option>
            {dataCategories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Label htmlFor="price" className="block mb-2">
            Price
          </Label>
          <FloatingLabel
            variant="outlined"
            label="Price"
            id="price"
            name="price"
            type="text"
            placeholder="Rp . 0"
            value={price}
            onChange={handleChange}
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" light />
                Loading...
              </div>
            ) : (
              "Create product"
            )}
          </Button>
        </form>
      </DataTable>
      <EditProduct
        isOpenDrawerUpdateProduct={editProductDrawerOpen}
        setIsOpenDrawerUpdateProduct={setEditProductDrawerOpen}
        selectedProduct={selectedProduct}
        fetchProduct={fetchProducts}
        dataCategories={dataCategories}
        setToast={setToast}
        titleDrawer="Edit product"
        titleIcon={MdOutlineProductionQuantityLimits}
        
      />

      <DeleteProduct
        openModalDeleteProduct={deleteProductModalOpen}
        setOpenModalDeleteProduct={setDeleteProductModalOpen}
        selectedProduct={selectedProduct}
        fetchProduct={fetchProducts}
        setToast={setToast}
      />
    </>
  );
}
