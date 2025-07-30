import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function useCashierKasir() {
  const [dataCategoriesCashier, setDataCategoriesCashier] = useState([]);
  const [dataProducts, setDataProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchCategoriesCashier = async () => {
    const { data: catgeories, error } = await supabase
      .from("categories")
      .select("id, name");

    if (error) {
      console.error("err", error.message);
    } else {
      setDataCategoriesCashier(catgeories);
    }
  };

  const fecthProductCashier = async (categoryId = null, searchQuery = "") => {
    setLoadingProducts(true);
    let query = supabase.from("products").select("*");

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const safeSearch = (searchQuery || "").toString(); // pastikan string
    if (safeSearch.trim() !== "") {
      query = query.ilike("name", `%${safeSearch}%`);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("err", error.message);
    } else {
      setDataProducts(products);
    }
    setLoadingProducts(false);
  };

  return {
    dataCategoriesCashier,
    fetchCategoriesCashier,
    fecthProductCashier,
    dataProducts,
    loadingProducts,
    refetchCategories: fetchCategoriesCashier, // kalau mau bisa dipanggil ulang dari luar
  };
}
