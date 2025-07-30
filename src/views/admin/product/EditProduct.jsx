import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerItems,
  FloatingLabel,
  Spinner,
  Label,
  FileInput,
  Select,
} from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { formatRupiah } from "../../../hooks/formatRupiah";

export default function EditProduct({
  titleDrawer,
  titleIcon,
  isOpenDrawerUpdateProduct,
  setIsOpenDrawerUpdateProduct,
  selectedProduct, // ⬅️ Data Category yang dipilih
  fetchProduct, // ⬅️ Buat refresh data table
  setToast,
  dataCategories,
}) {
  const handleClose = () => setIsOpenDrawerUpdateProduct(false);
  const [isLoadingUpdateProduct, setIsLoadingUpdateProduct] = useState(false);
  const [priceValueUpdateProduct, setPriceValueUpdateProduct] = useState(0);
  const [nameUpdateProduct, setNameUpdateProduct] = useState("");
  const [priceUpdateProduct, setPriceUpdateProduct] = useState("");
  const [imageUrlUpdateProduct, setImageUrlUpdateProduct] = useState("");
  const [fileUpdateProduct, setFileUpdateProduct] = useState(null);
  const [categoryUpdateProduct, setCategoryUpdateProduct] = useState("");
  const [previewUrlUpdateProduct, setPreviewUrlUpdateProduct] = useState("");
  const previewUrlRef = useRef(null);
  const fileInputRef = useRef(null); // ⬅️ TAMBAHKAN INI

  useEffect(() => {
    if (selectedProduct) {
      setNameUpdateProduct(selectedProduct.name || "");
      setCategoryUpdateProduct(selectedProduct.category_id || "");
      setImageUrlUpdateProduct(selectedProduct.image_url || "");
      setPriceUpdateProduct(formatRupiah(selectedProduct.price) || "");
      setPriceValueUpdateProduct(selectedProduct.price || 0);
      setPreviewUrlUpdateProduct(selectedProduct.image_url || ""); // ✅ tambahkan ini
    }
  }, [selectedProduct]);

  const handleFileChangeUpdateProduct = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current); // ⬅️ bersihkan preview lama
      }

      const objectUrl = URL.createObjectURL(selectedFile);
      previewUrlRef.current = objectUrl;

      setFileUpdateProduct(selectedFile);
      setPreviewUrlUpdateProduct(objectUrl);
    } else {
      setFileUpdateProduct(null);
      setPreviewUrlUpdateProduct(imageUrlUpdateProduct); // fallback ke gambar dari database
    }
  };

  const handleSubmitProductEdit = async (e) => {
    e.preventDefault();
    setIsLoadingUpdateProduct(true);

    try {
      let uploadedImageUrlUpateProduct = imageUrlUpdateProduct; // fallback kalau sudah ada URL

      // 1️⃣ Cek file dari input
      if (fileUpdateProduct) {
        // Buat nama unik (timestamp + nama asli)
        const fileNameUpdateProduct = `${Date.now()}-${fileUpdateProduct.name}`;

        // Upload ke bucket Storage
        const { error: uploadError } = await supabase.storage
          .from("mycafestorage") // GANTI dengan nama bucket kamu
          .upload(`product-images/${fileNameUpdateProduct}`, fileUpdateProduct);

        if (uploadError) throw uploadError;

        // Ambil URL publik
        const { data: publicUrl } = supabase.storage
          .from("mycafestorage")
          .getPublicUrl(`product-images/${fileNameUpdateProduct}`);

        uploadedImageUrlUpateProduct = publicUrl.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("products")
        .update([
          {
            name: nameUpdateProduct,
            price: priceValueUpdateProduct,
            image_url: uploadedImageUrlUpateProduct,
            category_id: categoryUpdateProduct,
          },
        ])
        .eq("id", selectedProduct.id);

      if (updateError) throw updateError;
      await fetchProduct();
      setIsOpenDrawerUpdateProduct(false);

      // Opsional: Reset form
      setNameUpdateProduct("");
      setImageUrlUpdateProduct("");
      setCategoryUpdateProduct("");
      setFileUpdateProduct(null);
      setPriceUpdateProduct("");
      setToast({ type: "success", message: "update product berhasil!" });
    } catch (err) {
      console.error(err.message);
      setToast({ type: "error", message: err.message });
    } finally {
      setIsLoadingUpdateProduct(false);
    }
  };

  // Cleanup preview blob saat komponen unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleResetImage = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setFileUpdateProduct(null);
    setPreviewUrlUpdateProduct(imageUrlUpdateProduct);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // ⬅️ RESET INPUT FILE YANG NEMPEL NAMA FILE
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;

    // Hilangkan semua yang bukan angka
    let numericValue = value.replace(/[^0-9]/g, "");

    // Update angka murni
    setPriceValueUpdateProduct(numericValue ? parseInt(numericValue) : 0);

    // Update tampilan input
    setPriceUpdateProduct(formatRupiah(numericValue));
  };

  useEffect(() => {
    if (!isOpenDrawerUpdateProduct) {
      // Reset semua state ketika drawer ditutup
      setNameUpdateProduct("");
      setCategoryUpdateProduct("");
      setImageUrlUpdateProduct("");
      setFileUpdateProduct(null);
      setPriceUpdateProduct("");
      setPriceValueUpdateProduct(0);

      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // ⬅️ RESET INPUT FILE YANG NEMPEL NAMA FILE
      }

      // Hapus preview URL jika ada
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setPreviewUrlUpdateProduct("");
    }
  }, [isOpenDrawerUpdateProduct]);

  return (
    <Drawer
      open={isOpenDrawerUpdateProduct}
      onClose={handleClose}
      position="right"
      className="w-1/3"
    >
      <DrawerHeader title={titleDrawer} titleIcon={titleIcon} />
      <DrawerItems>
        <form className="space-y-4" onSubmit={handleSubmitProductEdit}>
          <div>
            <Label value="Gambar Produk" />
            <FileInput
              onChange={handleFileChangeUpdateProduct}
              ref={fileInputRef}
            />
            {previewUrlUpdateProduct && (
              <div className="relative mt-2">
                <img
                  src={previewUrlUpdateProduct}
                  alt="Preview"
                  className="object-cover w-full rounded h-52"
                />
                {fileUpdateProduct && (
                  <button
                    type="button"
                    onClick={handleResetImage}
                    className="absolute px-2 py-1 text-xs text-white bg-red-600 rounded top-1 right-1"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}
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
            value={nameUpdateProduct}
            onChange={(e) => setNameUpdateProduct(e.target.value)}
            required
          />
          <Label htmlFor="category" className="block mb-2">
            Category
          </Label>
          <Select
            id="category"
            name="category_id"
            value={categoryUpdateProduct}
            onChange={(e) => setCategoryUpdateProduct(e.target.value)}
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
            value={priceUpdateProduct}
            onChange={handleChange}
            required
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isLoadingUpdateProduct}
          >
            {isLoadingUpdateProduct ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" light />
                Loading...
              </div>
            ) : (
              "Update product"
            )}
          </Button>
        </form>
      </DrawerItems>
    </Drawer>
  );
}
