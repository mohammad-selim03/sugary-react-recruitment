import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const OrderSuccessPage = ({ clearCart }) => {
  const location = useLocation();
  
  // Clear cart on successful order
  useEffect(() => {
    // Optional: check URL parameters from Stripe to verify success
    clearCart();
  }, [clearCart]);
  
  return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <div className="bg-green-50 p-6 rounded-lg mb-6">
        <div className="w-16 h-16 bg-green-100 mx-auto rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-green-800 mb-2">Order Successful!</h1>
        <p className="text-green-700">Your payment was processed successfully.</p>
      </div>
      
      <p className="mb-6 text-gray-600">
        We've sent a confirmation email with your order details.
        Your order will be shipped soon.
      </p>
      
      <Link 
        to="/" 
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default OrderSuccessPage;