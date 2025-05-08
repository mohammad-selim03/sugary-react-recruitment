import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe publishable key
const stripePromise = loadStripe('pk_test_51O7qmVGR9hlKk72pMHG35MMR7ZuvW4xFgWERZsV4r0UtjXuG4gTgKsfM4utp2WhMrr8iyDTsihLLthcbem1t0yEq000EoeHwMX');

// Define props interface
interface StripeCheckoutProps {
  cart: Material[];
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateShipping: () => number;
}

// Use the same Material interface from your CartPage
interface Material {
  Id: number;
  Title: string;
  BrandName: string;
  CoverPhoto: string;
  SalesPriceInUsd: number;
  Quantity?: number;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ 
  cart, 
  calculateSubtotal, 
  calculateTax,
  calculateShipping
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      
      // Get Stripe instance
      const stripe = await stripePromise;
      
      if (!stripe) {
        alert("Stripe failed to load. Please try again later.");
        setIsProcessing(false);
        return;
      }
      
      // Create the checkout session on your backend
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: cart.map(item => ({
            id: item.Id,
            title: item.Title,
            brand: item.BrandName,
            price: item.SalesPriceInUsd,
            image: item.CoverPhoto,
            quantity: item.Quantity || 1
          })),
          subtotal: calculateSubtotal(),
          tax: calculateTax(),
          shipping: calculateShipping()
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout using the session ID
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error('Stripe checkout error:', error);
        alert('Payment failed: ' + error.message);
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      alert('An error occurred during checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button 
      onClick={handleCheckout}
      disabled={isProcessing || cart.length === 0}
      className="w-full px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center font-medium disabled:bg-blue-300"
    >
      {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
    </button>
  );
};

export default StripeCheckout;