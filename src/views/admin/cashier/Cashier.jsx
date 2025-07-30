import { Button, Dropdown, DropdownItem } from "flowbite-react";
import useCashierAdmin from "./useCashier";
import { useEffect, useState } from "react";
import AllProduct from "./dataProduct/dataProduct";
import { useOutletContext } from "react-router";
import DetailBuy from "./DetailBuy/DetailBuy";
import PageHead from "../../../components/commons/PageHead/PageHead";
import Toaster from "../../../components/commons/toast/toaster";

export default function CashierAdmin() {
  const {
    dataCategoriesCashier,
    fecthProductCashier,
    dataProducts,
    fetchCategoriesCashier,
    loadingProducts,
  } = useCashierAdmin();
  const { search } = useOutletContext();
  const [activeCategory, setActiveCategory] = useState("all");
  const visibleCategories = dataCategoriesCashier.slice(0, 5);
  const hiddenCategories = dataCategoriesCashier.slice(5);
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);
  const clearCart = () => setCartItems([]);

  const handleAddToCart = (product) => {
    const isExist = cartItems.find((item) => item.id === product.id);
    if (isExist) {
      const updatedItems = cartItems.map((item) =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      );
      setCartItems(updatedItems);
    } else {
      setCartItems([...cartItems, { ...product, qty: 1 }]);
    }
  };

  const handleIncreaseQty = (item) => {
    setCartItems(
      cartItems.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, qty: cartItem.qty + 1 }
          : cartItem
      )
    );
  };

  const handleDecreaseQty = (item) => {
    setCartItems(
      cartItems
        .map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, qty: cartItem.qty - 1 }
            : cartItem
        )
        .filter((cartItem) => cartItem.qty > 0)
    );
  };

  const handleRemoveFromCart = (item) => {
    setCartItems(cartItems.filter((cartItem) => cartItem.id !== item.id));
  };

  const handleCategoryClick = (categoryId) => {
    const selectedId = categoryId || "all";
    setActiveCategory(selectedId);
  };

  const isHiddenCategoryActive = hiddenCategories.some(
    (category) => category.id === activeCategory
  );

  useEffect(() => {
    fetchCategoriesCashier();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fecthProductCashier(
        activeCategory === "all" ? null : activeCategory,
        search
      );
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounce); // Clear timeout if search changes quickly
  }, [search, activeCategory]);

  return (
    <>
      {toast && (
        <Toaster
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <PageHead title="MyCafe | Cashier" />
      <div className="w-full px-4 py-4 bg-white/20 rounded-xl shadow-xl overflow-auto h-[600px]">
        <div className="sticky top-0 z-20 px-4 py-2 border shadow-lg backdrop-blur-md border-white/20 rounded-xl bg-white/10 ">
          <div className="grid items-center justify-around grid-cols-4 gap-4">
            <Button 
              onClick={() => handleCategoryClick("all")}
              className={`cursor-pointer ${
                activeCategory === "all"
                  ? "bg-blue-500 text-white shadow-md"
                  : "!bg-white/30 text-gray-700 !border-none shadow-md"
              }`}
            >
              All
            </Button>

            {/* Tombol per kategori */}
            {visibleCategories.map((category) => (
              <Button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`cursor-pointer ${
                  activeCategory === category.id
                    ? "bg-blue-500 text-white shadow"
                    : "!bg-white/30 text-gray-700 !border-none shadow-md"
                }`}
              >
                {category.name}
              </Button>
            ))}

            {/* Tombol Dropdown '>' */}
            {hiddenCategories.length > 0 && (
              <Dropdown
                label={
                  isHiddenCategoryActive
                    ? hiddenCategories.find((cat) => cat.id === activeCategory)
                        ?.name || "Lainnya"
                    : "Lainnya"
                }
                placement="bottom"
                color="white"
                className={`cursor-pointer ring-1 ${
                  isHiddenCategoryActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "!bg-white/30 text-gray-700 !border-none shadow-md"
                }`}
              >
                {hiddenCategories.map((category) => (
                  <DropdownItem
                    key={category.id}
                    color="white"
                    onClick={() => handleCategoryClick(category.id)}
                    className={`cursor-pointer block w-full text-left px-4 py-2 hover:bg-blue-100 rounded-md  border-gray-200 ${
                      activeCategory === category.id
                        ? "bg-blue-600 !text-white border-none gap-x-2"
                        : "!bg-white/30 !text-black !border-none shadow-md"
                    }`}
                  >
                    {category.name}
                  </DropdownItem>
                ))}
              </Dropdown>
            )}
          </div>
        </div>
        <div className="realtive">
          <div
            className={`grid grid-cols-${
              cartItems.length > 0 ? "5" : "1"
            } gap-4 mt-4`}
          >
            <div className={cartItems.length > 0 ? "col-span-3" : "col-span-4"}>
              <AllProduct
                activeCategory={activeCategory}
                dataProducts={dataProducts}
                loading={loadingProducts}
                search={search}
                onAddToCart={handleAddToCart}
                cartItems={cartItems}
              />
            </div>

            {cartItems.length > 0 && (
              <div className="fixed z-40 w-4/12 right-16 top-20">
                <DetailBuy
                  cartItems={cartItems}
                  onIncrease={handleIncreaseQty}
                  onDecrease={handleDecreaseQty}
                  onRemove={handleRemoveFromCart}
                  setToast={setToast}
                  clearCart={clearCart} // <-- Tambahkan ini
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
