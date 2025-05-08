import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router';

const CartPage = () => {
  const { cart, removeFromCart } = useContext(CartContext);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <ul>
            {cart.map((item) => (
              <li key={item.Id} className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-semibold">{item.Title}</p>
                  <p className="text-sm text-gray-500">{item.BrandName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-blue-600 font-bold">${item.SalesPriceInUsd.toFixed(2)}</p>
                  <button
                    onClick={() => removeFromCart(item.Id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-lg font-semibold">Total: ${cart.reduce((acc, item) => acc + item.SalesPriceInUsd, 0).toFixed(2)}</p>
            <Link to="/checkout" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
