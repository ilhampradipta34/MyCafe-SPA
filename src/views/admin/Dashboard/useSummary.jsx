/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function useSummary() {
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

  const fetchProduct = async () => {
    const { data, error, count } = await supabase
      .from("products")
      .select("*", { count: "exact" });

    if (error) {
      console.error("err", error.message);
      return;
    } else {
      setDataProduk(data);
      setCountProduk(count);
    }
  };
  const fetchCategories = async () => {
    const {
      data: category,
      error,
      count: categoriesCount,
    } = await supabase.from("categories").select("*", { count: "exact" });

    if (error) {
      console.error("err", error.message);
      return;
    } else {
      setDataCategories(category);
      setCountCategories(categoriesCount);
    }
  };
  const fetchOrders = async () => {
    const {
      data: orders,
      error,
      count: countOrders,
    } = await supabase.from("orders").select("*", { count: "exact" });

    if (error) {
      console.error("err", error.message);
      return;
    } else {
      setDataOrder(orders);
      setCountOrders(countOrders);
    }
  };
  const fetchOrdersItem = async () => {
    const {
      data: ordersItem,
      error,
      count: countOrdersItem,
    } = await supabase.from("order_items").select("*", { count: "exact" });

    if (error) {
      console.error("err", error.message);
      return;
    } else {
      setDataOrderItems(ordersItem);
      setCountOrdersItems(countOrdersItem);
    }
  };
  const fetchPayments = async () => {
    const {
      data: payment,
      error,
      count: countPayment,
    } = await supabase.from("payments").select("*", { count: "exact" });

    if (error) {
      console.error("err", error.message);
      return;
    } else {
      setDataPayments(payment);
      setCountPayments(countPayment);
    }
  };

  const fetchAll = useCallback (async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProduct(),
        fetchCategories(),
        fetchOrders(),
        fetchOrdersItem(),
        fetchPayments(),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  },[]);


  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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
