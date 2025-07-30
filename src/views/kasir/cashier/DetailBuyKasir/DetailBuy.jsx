/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { Button, Label, Radio, TextInput } from "flowbite-react";
import { formatRupiah } from "../../../../hooks/formatRupiah";
import {
  IoTrashOutline,
  IoRemove,
  IoAdd,
  IoCartOutline,
} from "react-icons/io5";
import { BsCashStack } from "react-icons/bs";
import { CiBank } from "react-icons/ci";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { loadMidtrans } from "../../../../lib/midtransClient";
import { environtment } from "../../../../utils/midtrans";

export default function DetailBuyKasir({
  cartItems = [],
  onIncrease,
  onDecrease,
  onRemove,
  setToast,
  clearCart, // ⬅️ Tambahkan ini
}) {
  const methodPay = [
    {
      key: "cash",
      name: "Cash",
      icon: <BsCashStack />,
    },
    {
      key: "va/qris",
      name: "VA/Qris",
      icon: <CiBank />,
    },
  ];

  const [selectedMethod, setSelectedMethod] = useState("");
  const [priceValue, setPriceValue] = useState(0);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (cartItems.length === 0 && !isVisible) return null; // Auto hide if empty

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth Error:", authError);
        setLoading(false);
        return;
      }

      // Gunakan user.id dari auth untuk mencocokkan dengan id_new di public.users
      const { data, error } = await supabase
        .from("users") // public.users
        .select("*")
        .eq("id_new", user.id) // mencocokkan id dari auth.users dengan id_new
        .single();

      if (error) {
        console.error("Query Error:", error);
      } else {
        setUserProfile(data);
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    let value = e.target.value;

    // Hilangkan semua yang bukan angka
    let numericValue = value.replace(/[^0-9]/g, "");

    // Update angka murni
    setPriceValue(numericValue ? parseInt(numericValue) : 0);

    // Update tampilan input
    setPrice(formatRupiah(numericValue));
  };

const handleSubmit = async () => {
  if (cartItems.length === 0 || !selectedMethod) {
    setToast({
      type: "warning",
      message: "Pilih metode pembayaran terlebih dahulu",
    });
    return;
  }

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.qty * item.price,
    0
  );

  // Validasi metode Cash
  if (selectedMethod === "Cash") {
    if (priceValue === 0) {
      setToast({
        type: "warning",
        message: "Masukkan nominal pembayaran cash",
      });
      return;
    }

    if (priceValue !== totalPrice) {
      setToast({
        type: "warning",
        message: "Jumlah pembayaran cash harus sama dengan total harga.",
      });
      return;
    }
  }

  const status = selectedMethod === "Cash" ? "paid" : "pending";

  // 1. Insert orders
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        user_id: userProfile.id,
        total_price: totalPrice,
        status,
      },
    ])
    .select()
    .single();

  if (orderError) {
    console.error("Gagal buat order:", orderError);
    setToast({
      type: "failed",
      message: "Gagal membuat pesanan.",
    });
    return;
  }

  const orderId = orderData.id;

  // 2. Insert order_items
  const orderItemsPayload = cartItems.map((item) => ({
    order_id: orderId,
    product_id: item.id,
    quantity: item.qty,
    price_each: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsPayload);

  if (itemsError) {
    console.error("Gagal simpan order_items:", itemsError);
    setToast({
      type: "failed",
      message: "Gagal menyimpan item pesanan.",
    });
    return;
  }

  // 3. Jika Cash: insert langsung ke payments dan selesai
  if (selectedMethod === "Cash") {
    const { error: paymentError } = await supabase.from("payments").insert([
      {
        order_id: orderId,
        amount: priceValue,
        payment_method: "Cash",
        paid_at: new Date().toISOString(),
      },
    ]);

    if (paymentError) {
      console.error("Gagal simpan cash:", paymentError);
      setToast({
        type: "failed",
        message: "Gagal menyimpan pembayaran.",
      });
      return;
    }

    finishPayment();
    return;
  }

  // 4. Jika VA/QRIS (Midtrans Snap)
  try {
    const res = await fetch(`${environtment.API_URL}api/payment-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, totalPrice }),
    });

    const { token } = await res.json();
    if (!token) throw new Error("Token pembayaran tidak ditemukan");

    await loadMidtrans();

    window.snap.pay(token, {
      onSuccess: async function (result) {
        await supabase.from("payments").insert([
          {
            order_id: orderId,
            amount: totalPrice,
            payment_method: result.payment_type,
            paid_at: new Date().toISOString(),
          },
        ]);

        await supabase
          .from("orders")
          .update({ status: "paid" })
          .eq("id", orderId);

        finishPayment();
      },
      onPending: function () {
        setToast({
          type: "info",
          message: "Menunggu penyelesaian pembayaran...",
        });
      },
      onError: function (err) {
        console.error("Midtrans error:", err);
        setToast({
          type: "failed",
          message: "Pembayaran gagal atau ditolak.",
        });
      },
      onClose: function () {
        console.log("Midtrans Snap ditutup oleh user.");
      },
    });
  } catch (err) {
    console.error("Gagal Snap:", err);
    setToast({
      type: "failed",
      message: "Gagal memproses Midtrans Snap.",
    });
  }
};

// Fungsi pasca pembayaran sukses
const finishPayment = () => {
  setToast({
    type: "success",
    message: "Pembayaran berhasil.",
  });

  // Reset
  setSelectedMethod("");
  setPrice("");
  setPriceValue(0);
  setIsVisible(false);

  setTimeout(() => {
    clearCart();
    // window.location.href = "http://localhost:5173/admin/cashier";
  }, 1000);
};

  return (
    <div className={`sticky  top-4 animate-fade-in transform transition-transform duration-500 ease-in-out
    ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}>
      <div className="p-4 rounded-xl bg-white/30 backdrop-blur-md shadow-xl h-fit space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <IoCartOutline />
          <h2 className="text-xl font-semibold text-white">
            Keranjang Belanja
          </h2>
        </div>

        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between p-3 rounded-lg shadow bg-white/10"
          >
            <div className="w-full">
              <p className="font-medium text-white">{item.name}</p>
              <p className="text-sm text-gray-300">
                Qty: {item.qty} × {formatRupiah(item.price)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  size="xs"
                  color="gray"
                  onClick={() => onDecrease(item)}
                  className="!px-2 cursor-pointer"
                >
                  <IoRemove />
                </Button>
                <span className="text-white">{item.qty}</span>
                <Button
                  size="xs"
                  color="gray"
                  onClick={() => onIncrease(item)}
                  className="!px-2 cursor-pointer"
                >
                  <IoAdd />
                </Button>
                <Button
                  size="xs"
                  color="failure"
                  onClick={() => onRemove(item)}
                  className="ml-2 cursor-pointer"
                >
                  <IoTrashOutline color="red" size={25} />
                </Button>
              </div>
            </div>
            <p className="ml-2 font-semibold text-right text-white whitespace-nowrap">
              {formatRupiah(item.qty * item.price)}
            </p>
          </div>
        ))}

        <hr className="border-white/20" />
        <p className="font-bold text-right text-white">
          Total:{" "}
          {formatRupiah(
            cartItems.reduce((total, item) => total + item.qty * item.price, 0)
          )}
        </p>
        <Label className="mb-2">Metode Pembayaran</Label>
        <div className="p-4 rounded-lg shadow bg-white/10">
          <div className="flex flex-col gap-5">
            {methodPay.map((pay, index) => (
              <div
                key={pay.key}
                className="flex items-center gap-2 p-3 rounded-md bg-white/20"
              >
                <Radio
                  type="radio"
                  id={`pay-${index}`}
                  name="methodPay"
                  value={pay.name}
                  className="cursor-pointer accent-blue-600"
                  onChange={() => setSelectedMethod(pay.name)}
                />
                <Label
                  htmlFor={`pay-${index}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {pay.icon} {pay.name}
                </Label>
              </div>
            ))}
            {selectedMethod === "Cash" && (
              <div className="mt-4">
                <Label htmlFor="cash-amount">Masukkan jumlah cash</Label>
                <TextInput
                  id="cash-amount"
                  type="text"
                  className="w-full p-2 mt-1 text-black bg-white rounded-md"
                  placeholder="Rp . 0"
                  color="white"
                  onChange={handleChange}
                  value={price}
                />
              </div>
            )}
          </div>
        </div>

        <Button
          className="w-full text-white bg-blue-600 shadow cursor-pointer hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Bayar Sekarang
        </Button>
      </div>
    </div>
  );
}
