/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import DataTable from "../../../components/commons/table/Table";
import { supabase } from "../../../lib/supabaseClient";
import PageHead from "../../../components/commons/PageHead/PageHead";
import { formatRupiah } from "../../../hooks/formatRupiah";
import { Button } from "flowbite-react";
import { filter } from "lodash";

export default function TransDashboard() {
  const [dataTransactions, setDataTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isFetching, setIsFetching] = useState(true);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const fetchTransactions = async () => {
    const from = (currentPage - 1) * itemsPerPage;
    const to =  from + itemsPerPage - 1;

    const { data, error, count } = await supabase
      .from("orders")
      .select(
        "*, users(name, role), order_items(id, order_id, product_id, quantity, price_each), payments(id, order_id, amount, payment_method, paid_at)",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Gagal fetch transaksi:", error.message);
    } else {
      const formattedData = data.map((order) => {
        const jumlah_item = order.order_items?.reduce(
          (acc, item) => acc + item.quantity,
          0
        );

        return {
          ...order,
          jumlah_item,
        };
      });

      setDataTransactions(formattedData);
      setTotalItems(count);
    }
    // ❗ Tambahkan ini biar loading berhenti:
    setIsFetching(false);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });

  //   const fetchTransactions = async () => {
  //     setIsFetching(true);
  //     const from = (currentPage - 1) * itemsPerPage;
  //     const to = from + itemsPerPage - 1;

  //     const { data, error } = await supabase
  //       .from("orders")
  //       .select(
  //         "*, order_items(id, order_id, product_id, quantity, price_each), payments(id, order_id, amount, payment_method, paid_at)"
  //       )
  //       .order("created_at", { ascending: false })
  //       .range(from, to);

  //     if (error) console.log("Fetch error:", error);
  //     else setDataTransactions(data);

  //     const { count, error: countError } = await supabase
  //       .from("orders")
  //       .select(
  //         "*, order_items(id, order_id, product_id, quantity, price_each), payments(id, order_id, amount, payment_method, paid_at",
  //         { count: "exact", head: true }
  //       );

  //     if (countError) console.error("Count error:", countError);
  //     else setTotalItems(count);
  //     setIsFetching(false);
  //   };

  //   const [name, setName] = useState("");
  //   const [price, setPrice] = useState("");
  //   const [imageUrl, setImageUrl] = useState("");
  //   const [file, setFile] = useState(null);
  //   const [category, setCategory] = useState("");

  const [search, setSearch] = useState("");

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
        .from("orders")
        .select(
          "*, users(name, role), order_items(id, order_id, product_id, quantity, price_each), payments(id, order_id, amount, payment_method, paid_at)"
        );

      if (error) console.error("Search error:", error);
      else {
        const filtered = data.filter((item) =>
          item.id.toString().includes(search)
        );
       
        setDataTransactions(filtered);
        setTotalItems(filtered.length);
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
    fetchTransactions();
  }, [currentPage, search]);

  const columns = [
    {
      key: "id",
      label: "Order ID",
    },
    {
      key: "created_at",
      label: "Tanggal",
      render: (row) => (row.created_at ? formatDate(row.created_at) : "-"),
    },
    {
      key: "user_id",
      label: "User",
      render: (row) => (
        <div className="flex gap-x-2">
          <p>
            {row.users?.name} ({row.users?.role})
          </p>
        </div>
      ),
    },
    {
      key: "jumlah_item",
      label: "Jumlah Item",
    },
    {
      key: "payment_method",
      label: "Metode Pembayaran",
      render: (row) => row.payments?.[0]?.payment_method || "-",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        return row.status === "paid" ? (
          <button  className="p-1.5 !text-white bg-green-500 rounded-md shadow-md">
            {row.status}
          </button>
        ) : row.status === "pending" ? (
          <button className="!text-white !bg-yellow-400 rounded-md shadow-md p-1.5">{row.status}</button>
        ) : (
          <button className="!text-white !bg-red-300 rounded-md shadow-md p-1.5">
            {row.status}
          </button>
        );
      },
    },

    {
      key: "total_price",
      label: "Total Harga",
      render: (row) => formatRupiah(row.total_price),
    },
    {
      key: "amount",
      label: "Total Dibayar",
      render: (row) => formatRupiah(row.payments?.[0]?.amount || 0),
    },
    {
      key: "paid_at",
      label: "Tanggal Bayar",
      render: (row) =>
        row.payments?.[0]?.paid_at ? formatDate(row.payments[0].paid_at) : "-",
    },
  ];

  return (
    <>
      <PageHead title={"Mycafe | Transaction"} />
      <DataTable
        title={"Manage all transaction"}
        description="Managae transaction mycafe"
        columns={columns} // ⬅️ WAJIB
        data={dataTransactions} // ⬅️ WAJIB
        empty="No transaction found"
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        isFetching={isFetching}
        search={search}
        setSearch={setSearch}
        showCreateButton={false}
      />
    </>
  );
}
