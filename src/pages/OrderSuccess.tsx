import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router';
import { CgSpinner } from 'react-icons/cg';
import { FaCheck, FaHome, FaShoppingBag } from 'react-icons/fa';

interface OrderDetails {
  id: string;
  customer_details?: {
    email: string;
    name: string;
  };
  amount_total: number;
  created: number;
  payment_status: string;
  currency: string;
  metadata: {
    orderId: string;
  };
}

const OrderSuccessPage = () => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get session_id from URL query parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session_id');

  useEffect(() => {
    // Clear cart on successful order
    localStorage.removeItem('cart_items');
    
    const fetchOrderDetails = async () => {
      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/checkout-session/${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        setOrderDetails(data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please contact customer support.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [sessionId]);

  // Format timestamp to readable date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: orderDetails?.currency || 'USD'
    }).format(amount / 100); // Stripe amounts are in cents
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center h-64">
        <CgSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
        <p className="text-gray-600">Processing your order...</p>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Something went wrong</h1>
          <p className="text-red-600 mb-6">{error || 'Order details could not be loaded'}</p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/" 
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 inline-flex items-center"
            >
              <FaHome className="mr-2" /> Return Home
            </Link>
            <Link 
              to="/cart" 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-flex items-center"
            >
              <FaShoppingBag className="mr-2" /> Go to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheck className="text-green-600 text-3xl" />
        </div>
        <h1 className="text-3xl font-bold text-green-700 mb-2">Order Confirmed!</h1>
        <p className="text-green-600 text-lg">Thank you for your purchase</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Summary</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-medium">{orderDetails.metadata.orderId}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Date:</span>
            <span>{formatDate(orderDetails.created)}</span>
          </div>
          
          {orderDetails.customer_details?.email && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Email:</span>
              <span>{orderDetails.customer_details.email}</span>
            </div>
          )}
          
          {orderDetails.customer_details?.name && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Name:</span>
              <span>{orderDetails.customer_details.name}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Payment Status:</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              {orderDetails.payment_status.charAt(0).toUpperCase() + orderDetails.payment_status.slice(1)}
            </span>
          </div>
          
          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <span className="text-lg font-bold">Total:</span>
            <span className="text-lg font-bold">{formatCurrency(orderDetails.amount_total)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center gap-4">
        <Link 
          to="/" 
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 inline-flex items-center"
        >
          <FaHome className="mr-2" /> Return Home
        </Link>
        <Link 
          to="/orders" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-flex items-center"
        >
          <FaShoppingBag className="mr-2" /> View All Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;