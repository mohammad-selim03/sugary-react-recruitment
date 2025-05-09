import { useEffect, useState } from "react";
import { Link } from "react-router";
import { CgSpinner } from "react-icons/cg";
import { FaTrash, FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import StripeCheckout from "./StripeCheckout";

// Define the Material interface
interface Material {
  Id: number;
  Title: string;
  BrandName: string;
  CoverPhoto: string;
  SalesPriceInUsd: number;
  Quantity?: number;
}

const imageBaseUrl = import.meta.env.VITE_IMAGE_URL || "";

const CartPage = () => {
  const [cart, setCart] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);

  useEffect(() => {
    const loadCart = () => {
      setLoading(true);
      try {
        const cartKey = "cart_items";
        const storedCart = localStorage.getItem(cartKey);
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          const cartWithQuantity = parsedCart.map((item: Material) => ({
            ...item,
            Quantity: item.Quantity || 1,
          }));
          setCart(cartWithQuantity);
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Realtime sync if localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart_items") {
        const updatedCart = JSON.parse(
          localStorage.getItem("cart_items") || "[]"
        );
        const cartWithQuantity = updatedCart.map((item: Material) => ({
          ...item,
          Quantity: item.Quantity || 1,
        }));
        setCart(cartWithQuantity);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const removeFromCart = (id: number) => {
    setItemToRemove(id);
    setTimeout(() => {
      const updatedCart = cart.filter((item) => item.Id !== id);
      setCart(updatedCart);
      localStorage.setItem("cart_items", JSON.stringify(updatedCart));
      setItemToRemove(null);
    }, 300);
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map((item) =>
      item.Id === id ? { ...item, Quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart_items", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart_items");
  };

  const calculateSubtotal = () =>
    cart.reduce(
      (acc, item) => acc + item.SalesPriceInUsd * (item.Quantity || 1),
      0
    );

  const calculateShipping = () => (calculateSubtotal() > 50 ? 0 : 5.99);

  const calculateTax = () => calculateSubtotal() * 0.0825;

  const calculateTotal = () =>
    calculateSubtotal() + calculateShipping() + calculateTax();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center h-64">
        <CgSpinner className="animate-spin text-3xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center text-gray-800">
          <FaShoppingCart className="mr-2" /> Your Cart
        </h1>
        <Link
          to="/materials"
          className="flex items-center text-sm md:text-base text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-1" /> Continue Shopping
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-2 md:p-4 lg:p-6 xl:p-8 text-center flex flex-col items-center justify-center h-96 md:h-screen">
          <div className="text-gray-500 text-6xl mb-4 flex justify-center">
            <FaShoppingCart />
          </div>
          <p className="text-xl mb-6">Your cart is empty</p>
          <Link
            to="/materials"
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 inline-flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Go Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Cart Items */}
          <div className="w-full md:w-2/3 ">
            <div className="md:bg-white rounded-lg md:shadow-md overflow-hidden">
              <div className="overflow-x-auto max-w-[350px] max-w-[450px]:w-[400px] md:w-full">
                <table className="w-[250px] sm:w-full md:min-w-[600px] overflow-hidden md:w-full text-sm text-gray-700">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-center">Quantity</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => (
                      <tr
                        key={item.Id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } border-t border-gray-100 hover:bg-gray-100 transition duration-150 ${
                          itemToRemove === item.Id
                            ? "opacity-50 bg-red-100"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 flex-shrink-0 mr-3 rounded overflow-hidden bg-gray-100 border">
                              <img
                                src={
                                  item.CoverPhoto
                                    ? `${imageBaseUrl}${item.CoverPhoto}`
                                    : "/fallback.jpg"
                                }
                                alt={item.Title}
                                className="w-full h-full object-cover"
                                onError={(e) =>
                                  ((e.target as HTMLImageElement).src =
                                    "/fallback.jpg")
                                }
                              />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {item.Title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.BrandName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.Id,
                                  (item.Quantity || 1) - 1
                                )
                              }
                              className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 hover:bg-blue-100 text-sm font-semibold transition"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {item.Quantity || 1}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.Id,
                                  (item.Quantity || 1) + 1
                                )
                              }
                              className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 hover:bg-blue-100 text-sm font-semibold transition"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="font-semibold text-gray-800">
                            $
                            {(
                              item.SalesPriceInUsd * (item.Quantity || 1)
                            ).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${item.SalesPriceInUsd.toFixed(2)} each
                          </p>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => removeFromCart(item.Id)}
                            className="text-red-600 hover:text-red-800 p-2"
                            aria-label="Remove item"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center"
                >
                  <FaTrash className="mr-1" /> Clear Cart
                </button>
                <p className="text-sm text-gray-500">
                  {cart.length} item{cart.length > 1 ? "s" : ""} in cart
                </p>
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Order Summary
              </h2>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {calculateShipping() === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `$${calculateShipping().toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8.25%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div
                className={`p-3 rounded text-sm mb-4 ${
                  calculateSubtotal() < 50
                    ? "bg-blue-50 text-blue-800"
                    : "bg-green-50 text-green-700 ring ring-green-200"
                }`}
              >
                {calculateSubtotal() < 50 ? (
                  <>
                    Add ${50 - calculateSubtotal().toFixed(2)} more to get free shipping!
                  </>
                ) : (
                  <>
                    🎉 You’ve unlocked <strong>free shipping</strong>!
                  </>
                )}
              </div>

              <StripeCheckout
                cart={cart}
                calculateSubtotal={calculateSubtotal}
                calculateTax={calculateTax}
                calculateShipping={calculateShipping}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
