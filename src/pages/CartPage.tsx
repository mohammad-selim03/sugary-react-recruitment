import { useEffect, useState } from 'react';
import { Link } from 'react-router'; // Fixed import to react-router-dom
import { CgSpinner } from "react-icons/cg";
import { FaTrash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import StripeCheckout from './StripeCheckout'; // Import the new StripeCheckout component

// Define the Material interface
interface Material {
  Id: number;
  Title: string;
  BrandName: string;
  CoverPhoto: string;
  SalesPriceInUsd: number;
  Quantity?: number; // Adding quantity for cart functionality
}

const imageBaseUrl = import.meta.env.VITE_IMAGE_URL || '';

const CartPage = () => {
  const [cart, setCart] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);

  useEffect(() => {
    // Load cart items from localStorage
    const loadCart = () => {
      setLoading(true);
      try {
        const cartKey = "cart_items";
        const storedCart = localStorage.getItem(cartKey);
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          // Add quantity property if not present
          const cartWithQuantity = parsedCart.map((item: Material) => ({
            ...item,
            Quantity: item.Quantity || 1
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

  const removeFromCart = (id: number) => {
    setItemToRemove(id);
    setTimeout(() => {
      const updatedCart = cart.filter(item => item.Id !== id);
      setCart(updatedCart);
      localStorage.setItem("cart_items", JSON.stringify(updatedCart));
      setItemToRemove(null);
    }, 300);
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item => 
      item.Id === id ? { ...item, Quantity: newQuantity } : item
    );
    
    setCart(updatedCart);
    localStorage.setItem("cart_items", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart_items");
  };

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => acc + (item.SalesPriceInUsd * (item.Quantity || 1)), 0);
  };

  // Calculate shipping (free if subtotal > $50)
  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 50 ? 0 : 5.99;
  };

  // Calculate tax (8.25%)
  const calculateTax = () => {
    return calculateSubtotal() * 0.0825;
  };

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center h-64">
        <CgSpinner className="animate-spin text-3xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <FaShoppingCart className="mr-2" /> Your Cart
        </h1>
        <Link 
          to="/" 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-1" /> Continue Shopping
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-500 text-6xl mb-4 flex justify-center">
            <FaShoppingCart />
          </div>
          <p className="text-xl mb-6">Your cart is empty</p>
          <Link 
            to="/" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Go Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-center">Quantity</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr 
                      key={item.Id} 
                      className={`border-t border-gray-100 ${itemToRemove === item.Id ? 'opacity-50 bg-red-50' : ''}`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 flex-shrink-0 mr-3 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={item.CoverPhoto ? `${imageBaseUrl}${item.CoverPhoto}` : "/fallback.jpg"}
                              alt={item.Title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/fallback.jpg";
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{item.Title}</p>
                            <p className="text-sm text-gray-500">{item.BrandName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center">
                          <button 
                            onClick={() => updateQuantity(item.Id, (item.Quantity || 1) - 1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="mx-2 w-8 text-center">{item.Quantity || 1}</span>
                          <button 
                            onClick={() => updateQuantity(item.Id, (item.Quantity || 1) + 1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <p className="font-semibold">${(item.SalesPriceInUsd * (item.Quantity || 1)).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">${item.SalesPriceInUsd.toFixed(2)} each</p>
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
              <div className="p-4 border-t border-gray-100 flex justify-between">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center"
                >
                  <FaTrash className="mr-1" /> Clear Cart
                </button>
                <p className="text-sm text-gray-500">{cart.length} item(s) in cart</p>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {calculateShipping() === 0 ? 
                      <span className="text-green-600">Free</span> : 
                      `$${calculateShipping().toFixed(2)}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8.25%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              
              {calculateSubtotal() < 50 && (
                <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-4">
                  Add ${(50 - calculateSubtotal()).toFixed(2)} more to get free shipping!
                </div>
              )}
              
              {/* Replace Link with StripeCheckout component */}
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