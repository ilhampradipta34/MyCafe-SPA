/* eslint-disable no-unused-vars */
import { Card, Datepicker } from "flowbite-react";
import {
  FaBoxOpen,
  FaBoxTissue,
  FaFire,
  FaList,
  FaMoneyBillWave,
} from "react-icons/fa";
import {
  MdAttachMoney,
  MdProductionQuantityLimits,
  MdSell,
  MdTrendingUp,
} from "react-icons/md";
import { TfiCreditCard } from "react-icons/tfi";
import useSummary from "./useSummary";
import { formatRupiah } from "../../../hooks/formatRupiah";
import dayjs from "dayjs";
import { FaMoneyBills } from "react-icons/fa6";
import { useEffect, useMemo, useState } from "react";
import {
  ChartContainer,
  BarPlot,
  LinePlot,
  ChartsXAxis,
  ChartsYAxis,
  ChartsGrid,
  ChartsTooltip,
  MarkPlot,
  BarChart,
  LineChart,
} from "@mui/x-charts";
import { IoMdRefresh } from "react-icons/io";

export default function SummaryDashboard() {
  const {
    countProduk,
    dataProduk,
    countCategories,
    dataCategories,
    countOrders,
    dataOrder,
    countOrdersItems,
    dataOrderItems,
    countPayments,
    dataPayments,
    refresh,
    loading
  } = useSummary();

  const SellingTotalProduct =
    dataOrderItems?.reduce?.((total, item) => total + item.quantity, 0) ?? 0;

  const paidCount = dataOrder.filter((order) => order.status === "paid").length;
  const pendingCount = dataOrder.filter(
    (order) => order.status === "pending"
  ).length;
  const cancelledCount = dataOrder.filter(
    (order) => order.status === "cancelled"
  ).length;

  const today = new Date().toISOString().split("T")[0]; // "2025-07-28"

  const TotalRevenue = dataPayments.reduce(
    (total, pay) => total + pay.amount,
    0
  );

  const todayRevenue = dataPayments
    .filter((pay) => pay.paid_at && pay.paid_at.startsWith(today))
    .reduce((total, pay) => total + pay.amount, 0);

  const currentYear = dayjs().year();

  // Siapkan array 12 bulan
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyRevenue = useMemo(() => {
    const result = new Array(12).fill(0);
    dataPayments.forEach((pay) => {
      const date = dayjs(pay.paid_at);
      if (date.year() === currentYear) {
        const monthIndex = date.month(); // 0 = Jan
        result[monthIndex] += pay.amount;
      }
    });
    return result;
  }, [dataPayments, currentYear]);

  const dataset = monthLabels.map((label, index) => ({
    month: label,
    revenue: monthlyRevenue[index],
  }));

  const pesananPerKategori = dataOrderItems.reduce((acc, item) => {
    // Cari produk berdasarkan product_id
    const produk = dataProduk.find((p) => p.id === item.product_id);
    if (!produk) return acc;

    // Cari kategori berdasarkan categories_id
    const kategori = dataCategories.find((k) => k.id === produk.category_id);
    if (!kategori) return acc;

    // Tambahkan quantity berdasarkan kategori
    if (!acc[kategori.name]) {
      acc[kategori.name] = 0;
    }
    acc[kategori.name] += item.quantity;

    return acc;
  }, {});

  const datasetPesananPerKategori = Object.entries(pesananPerKategori).map(
    ([kategori, total], index) => ({
      kategori,
      total: isNaN(total) ? 0 : Number(total),
      color: index === 0 ? "#3B82F6" : "#9CA3AF", // biru terang & abu-abu redup
    })
  );

  // Hitung total quantity per produk
  const produkTerlaris = dataOrderItems.reduce((acc, item) => {
    const existing = acc.find((p) => p.product_id === item.product_id);
    if (existing) {
      existing.totalQuantity += item.quantity;
    } else {
      acc.push({
        product_id: item.product_id,
        totalQuantity: item.quantity,
      });
    }
    return acc;
  }, []);

  // Urutkan dari quantity terbanyak
  produkTerlaris.sort((a, b) => b.totalQuantity - a.totalQuantity);

  // Gabungkan dengan nama dan harga produk
  const produkTerlarisDenganNama = produkTerlaris.map((item) => {
    const produk = dataProduk.find((p) => p.id === item.product_id);
    return {
      ...item,
      name: produk?.name || "Tidak diketahui",
      price: produk?.price || 0,
    };
  });

  const [chartData, setChartData] = useState([]);

  const todayOrders = new Date();
  const currentYearOrders = todayOrders.getFullYear();
  const currentMonth = todayOrders.getMonth();

  const currentMonthName = monthLabels[currentMonth];

  useEffect(() => {
    const todayOrders = new Date();
    const currentYearOrders = todayOrders.getFullYear();
    const currentMonth = todayOrders.getMonth();

    const currentMonthName = monthLabels[currentMonth];

    // Filter order berstatus paid dan di bulan + tahun saat ini
    const paidOrdersThisMonth = dataOrder.filter((order) => {
      const orderDate = new Date(order.created_at);
      return (
        order.status === "paid" &&
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    // Group order per tanggal
    const ordersByDate = {};
    paidOrdersThisMonth.forEach((order) => {
      const dateKey = new Date(order.created_at).toISOString().split("T")[0]; // format YYYY-MM-DD
      ordersByDate[dateKey] = (ordersByDate[dateKey] || 0) + 1;
    });

    // Generate array tanggal dalam bulan ini
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyOrderCounts = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      dailyOrderCounts.push({
        date: dateStr,
        total: ordersByDate[dateStr] || 0,
      });
    }
    setChartData(dailyOrderCounts);
  }, [dataOrder]);

  const xAxisLabels = chartData.map((item) => item.date.split("-")[2]); // Hanya ambil tanggal
  const yAxisValues = chartData.map((item) => item.total);

  return (
    <div className="mx-2 mt-4">
      <button
        onClick={refresh}
        className="flex items-center justify-center gap-2 px-2 py-2 mb-3 text-white bg-blue-600 rounded shadow-md cursor-pointer"
        disabled={loading}
      >
        <IoMdRefresh className={loading ? "animate-spin" : ""} />
        {loading ? "Refreshing..." : "Refresh"}
      </button>
      <div className="grid grid-cols-12 gap-4 mb-5">
        {/* Kartu kecil: Produk, Kategori, Pesanan */}
        <Card className="h-20 !bg-white flex items-center justify-center rounded-lg px-4 col-span-2 border-none">
          <div className="flex items-center justify-start w-32 gap-2 mt-1 ">
            <MdProductionQuantityLimits size={18} />
            <h5 className="text-sm font-bold text-[#1976d2]">Produk Total</h5>
          </div>
          <h1 className="-mt-3 text-xl font-bold text-black text-start">
            {countProduk}
          </h1>
        </Card>
        <Card className="h-20 !bg-white flex items-center justify-center rounded-lg px-4 col-span-2 border-none">
          <div className="flex items-center justify-start w-32 gap-2 mt-1 ">
            <MdSell size={18} />
            <h5 className="text-sm font-bold text-[#1976d2]">Produk Terjual</h5>
          </div>
          <h1 className="-mt-3 text-xl font-bold text-black text-start">
            {SellingTotalProduct}
          </h1>
        </Card>

        <Card className="flex items-center justify-center h-20 col-span-2 px-4 !bg-white  rounded-lg border-none">
          <div className="flex items-center w-32 mt-1 gap-x-2">
            <FaList size={18} />
            <h5 className="text-sm font-bold text-[#1976d2]">Total Kategori</h5>
          </div>
          <h1 className="-mt-3 text-xl font-bold text-black">
            {countCategories}
          </h1>
        </Card>

        <Card className="flex items-center justify-center h-20 col-span-2 px-4 !bg-white rounded-lg border-none">
          <div className="flex items-center w-32 mt-1 gap-x-2">
            <FaBoxTissue size={18} />
            <h5 className="text-sm font-bold text-[#1976d2]">
              Total Orderan Masuk
            </h5>
          </div>
          <h1 className="-mt-3 text-xl font-bold text-black">{countOrders}</h1>
        </Card>
        <Card className="flex flex-col justify-center h-20 col-span-4 px-4 !bg-white rounded-lg border-none">
          <div className="flex items-center justify-center mb-2 gap-x-2">
            <TfiCreditCard size={18} />
            <h5 className="text-sm font-bold text-[#1976d2]">Status</h5>
          </div>
          <div className="grid grid-cols-3 -mt-3 text-center gap-x-4">
            <div className="border-r border-gray-300">
              <h1 className="text-sm font-bold text-green-500">Paid</h1>
              <p className="text-sm font-semibold">{paidCount}</p>
            </div>
            <div className="border-r border-gray-300">
              <h1 className="text-sm font-bold text-amber-400">Pending</h1>
              <p className="text-sm font-semibold">{pendingCount}</p>
            </div>
            <div>
              <h1 className="text-sm font-bold text-red-500">Cancelled</h1>
              <p className="text-sm font-semibold">{cancelledCount}</p>
            </div>
          </div>
        </Card>

        {/* Kartu besar: Total Pendapatan dan Pendapatan Hari Ini */}
        <Card className="flex items-center justify-center h-20 col-span-6 px-4 !bg-white rounded-lg border-none">
          <div className="flex items-center justify-center mt-1 w-52 gap-x-2">
            <MdAttachMoney size={18} />
            <h5 className="text-sm font-bold text-[#1976d2]">
              Total Pendapatan
            </h5>
          </div>
          <h1 className="-mt-3 text-xl font-bold text-center text-black">
            {formatRupiah(TotalRevenue)}
          </h1>
        </Card>

        <Card className="flex items-center justify-center h-20 col-span-6 px-4 !bg-white rounded-lg border-none">
          <div className="flex items-center justify-center mt-1 gap-x-2 w-52">
            <FaMoneyBillWave size={20} />
            <h5 className="text-sm font-bold text-[#1976d2]">
              Pendapatan Hari Ini
            </h5>
          </div>
          <h1 className="-mt-3 text-xl font-bold text-center text-black">
            {formatRupiah(todayRevenue)}
          </h1>
        </Card>
      </div>

      <div className="grid grid-cols-7 gap-4">
        <Card className="h-72 !bg-white rounded-lg px-4 col-span-3 border-none">
          {/* Judul */}
          <div className="flex items-center justify-start gap-2 pt-4 -ml-5">
            <FaMoneyBills size={18} />
            <h5 className="text-sm font-bold text-[#1976d2]">
              Pendapatan Per Bulan - {currentYear}
            </h5>
          </div>

          {/* Chart */}
          <div className="w-full h-full -mt-2 -ml-10">
            <ChartContainer
              series={[
                { type: "bar", dataKey: "revenue", color: "#6366f1" },
                { type: "line", dataKey: "revenue", color: "#10b981" },
              ]}
              xAxis={[{ scaleType: "band", dataKey: "month", label: "Bulan" }]}
              yAxis={[{ id: "leftAxis", width: 60 }]}
              dataset={dataset}
              height={250} // dikurangi agar tidak melebihi tinggi Card
              width={400}
            >
              {/* <ChartsGrid horizontal /> */}
              <BarPlot />
              <LinePlot />
              <MarkPlot />
              <ChartsXAxis />
              <ChartsYAxis axisId="leftAxis" label="Rp (Pendapatan)" />
              <ChartsTooltip />
            </ChartContainer>
          </div>
        </Card>

        <Card className="h-72 !bg-white rounded-lg px-4 col-span-4 border-none">
          {/* Header */}
          <div className="flex items-center justify-start gap-2 pt-4 -mt-5 -ml-5">
            <FaBoxOpen size={18} />
            <h5 className="text-sm font-bold text-[#1976d2]">
              Produk Terjual Per Kategori
            </h5>
          </div>

          {/* Chart */}
          <div className="w-full h-full">
            <BarChart
              dataset={datasetPesananPerKategori}
              xAxis={[
                { scaleType: "band", dataKey: "kategori", label: "Kategori" },
              ]}
              series={[
                { dataKey: "total", label: "Produk Terjual per kategori" },
              ]}
              width={550} // Ukuran chart bisa lebih besar dari card untuk scroll horizontal
              height={200} // Sesuai dengan tinggi card (72 = 288px)
            />
          </div>
        </Card>

        <Card className="h-72 !bg-white  rounded-lg px-4 col-span-4 border-none">
          <div className="flex items-center justify-start gap-2 pt-4 -mt-5 -ml-5">
            <FaFire size={18} />
            <h5 className="text-sm font-bold text-[#1976d2]">
              Produk Terlaris
            </h5>
          </div>
          <div className="-ml-3 overflow-y-auto text-sm max-h-64">
            <table className="w-full text-sm border-none table-auto ">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">No.</th>
                  <th className="px-4 py-2 text-left border">Nama Produk</th>
                  <th className="px-4 py-2 border">Jumlah</th>
                  <th className="px-4 py-2 border">Harga</th>
                </tr>
              </thead>
              <tbody>
                {produkTerlarisDenganNama.slice(0, 5).map((produk, index) => (
                  <tr key={produk.produk_id} className="text-center">
                    <td className="px-4 py-2 border">{index + 1}</td>
                    <td className="px-4 py-2 text-left border">
                      {produk.name}
                    </td>
                    <td className="px-4 py-2 border">{produk.totalQuantity}</td>
                    <td className="px-4 py-2 border">
                      Rp{produk.price.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="h-72 !bg-white  rounded-lg px-4 col-span-3 border-none">
          <div className="flex items-center justify-start gap-2 pt-4 -mt-6 -ml-5">
            <MdTrendingUp size={18} />
            <h5 className="text-sm font-bold text-[#1976d2]">
              Jumlah Order Harian (paid) selama 1 bulan {currentMonthName}
            </h5>
          </div>
          <div className="-ml-16 overflow-y-auto text-sm max-h-64">
            <LineChart
              xAxis={[{ scaleType: "point", data: xAxisLabels }]}
              series={[{ data: yAxisValues, label: "Paid Orders" }]}
              width={380}
              height={180}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
