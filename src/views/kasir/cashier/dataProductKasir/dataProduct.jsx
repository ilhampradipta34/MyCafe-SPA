import { Button, Card, Spinner } from "flowbite-react";

import { IoCartOutline } from "react-icons/io5";
import { formatRupiah } from "../../../../hooks/formatRupiah";

export default function AllProductKasir({
  activeCategory,
  dataProducts,
  loading,
  search,
  onAddToCart,
  cartItems
}) {
  const isCartOpen = cartItems?.length > 0;

  return (
    <div
      className={`grid ${
        isCartOpen ? "grid-cols-2 " : "grid-cols-4"
      } gap-4 mt-4 transition-all`}
    >
      {loading ? (
        <div className="flex justify-center items-center w-full col-span-4 min-h-[300px]">
          <Spinner />
        </div>
      ) : dataProducts.length === 0 ? (
        <p className="flex justify-center items-center w-full col-span-4 min-h-[200px] text-center text-white">
          Tidak ada produk ditemukan.
        </p>
      ) : (
        // setelah dataProducts ready, baru filter dan render
        dataProducts
          .filter((product) => {
            const matchCategory =
              activeCategory === "all" ||
              product.category_id === activeCategory;
            const matchSearch =
              search.trim() === "" ||
              product.name.toLowerCase().includes(search.toLowerCase());
            return matchCategory && matchSearch;
          })
          .map((product) => (
            <Card
              className={`${isCartOpen ? "w-80" : "max-w-sm"} overflow-hidden border shadow-lg !bg-white/30 !backdrop-blur-md !border-white/10 rounded-xl hover:scale-[1.02]  hover:shadow-2xl transition-all duration-300 ease-in-out ring-1 ring-white/20`}
              key={product.id}
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="object-cover w-full h-40 rounded-t-lg"
              />
              <div>
                <h5 className="mb-3 text-lg font-bold tracking-tight text-white/90 ">
                  {product.name}
                </h5>
                <h3 className="mb-5 text-sm font-semibold tracking-tight text-left text-white/90 ">
                  {formatRupiah(product.price)}
                </h3>
                <Button
                  className="flex w-full mt-3 shadow-md cursor-pointer gap-x-2 hover:bg-blue-600/90 backdrop-blur-sm rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg"
                  onClick={() => onAddToCart(product)}
                >
                  <IoCartOutline />
                  <p>Add to cart</p>
                </Button>
              </div>
            </Card>
          ))
      )}
    </div>
  );
}
