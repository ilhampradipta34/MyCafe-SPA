/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../components/context/useAuth";

export default function useSummaryKasir() {
  const { session, role } = useAuth(); // ambil ID user
  const authId = session?.user?.id;

  const [userId, setUserId] = useState(null); // id dari public.users
  const [countProduk, setCountProduk] = useState(0);
  const [dataProduk, setDataProduk] = useState([]);
  const [countCategories, setCountCategories] = useState(0);
  const [dataCategories, setDataCategories] = useState([]);
  const [dataOrder, setDataOrder] = useState([]);
  const [countOrders, setCountOrders] = useState(0);
  const [dataOrderItems, setDataOrderItems] = useState([]);
  const [countOrdersItems, setCountOrdersItems] = useState(0);
  const [dataPayments, setDataPayments] = useState([]);
  const [countPayments, setCountPayments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserId = async () => {
    if (!authId) return;

    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("id_new", authId)
      .single();

    if (error) {
      console.error("Gagal ambil userId dari public.users:", error.message);
    } else {
      setUserId(data?.id);
    }
  };

  const fetchProduct = async () => {
    const { data, error, count } = await supabase
      .from("products")
      .select("*", { count: "exact" });

    if (error) return console.error("err", error.message);
    setDataProduk(data);
    setCountProduk(count);
  };

  const fetchCategories = async () => {
    const { data, error, count } = await supabase
      .from("categories")
      .select("*", { count: "exact" });

    if (error) return console.error("err", error.message);
    setDataCategories(data);
    setCountCategories(count);
  };

  const fetchOrders = async () => {
    const { data, error, count } = await supabase
      .from("orders")
      .select("*", { count: "exact" })
      .eq("user_id", userId); // hanya ambil milik kasir

    if (error) return console.error("err", error.message);
    setDataOrder(data);
    setCountOrders(count);
  };

  const fetchOrdersItem = async () => {
    // Ambil semua order milik kasir
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", userId);

    if (ordersError) return console.error("orders error:", ordersError.message);

    const orderIds = orders.map((o) => o.id);

    if (orderIds.length === 0) {
      setDataOrderItems([]);
      setCountOrdersItems(0);
      return;
    }

    const { data, error, count } = await supabase
      .from("order_items")
      .select("*", { count: "exact" })
      .in("order_id", orderIds);

    if (error) return console.error("order_items error:", error.message);
    setDataOrderItems(data);
    setCountOrdersItems(count);
  };

  const fetchPayments = async () => {
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", userId);

    if (ordersError) return console.error("orders error:", ordersError.message);

    const orderIds = orders.map((o) => o.id);

    if (orderIds.length === 0) {
      setDataPayments([]);
      setCountPayments(0);
      return;
    }

    const { data, error, count } = await supabase
      .from("payments")
      .select("*", { count: "exact" })
      .in("order_id", orderIds);

    if (error) return console.error("payments error:", error.message);
    setDataPayments(data);
    setCountPayments(count);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      if (role === "kasir") {
        await Promise.all([
          fetchProduct(),
          fetchCategories(),
          fetchOrders(),
          fetchOrdersItem(),
          fetchPayments(),
        ]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  useEffect(() => {
    if (authId) {
      fetchUserId(); // ambil userId lokal
    }
  }, [authId]);

  useEffect(() => {
    if (userId) {
      fetchAll();
    }
  }, [userId, fetchAll]);

  return {
    dataProduk,
    countProduk,
    dataCategories,
    countCategories,
    dataOrder,
    countOrders,
    dataOrderItems,
    countOrdersItems,
    dataPayments,
    countPayments,
    loading,
    refresh: fetchAll,
  };
}
