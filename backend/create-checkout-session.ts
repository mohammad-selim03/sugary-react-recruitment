// Example backend implementation (Node.js/Express)
// This would go in your server code, not in your React app

import express from 'express';
import  stripe from 'stripe';
// (process.env.STRIPE_SECRET_KEY)
const router = express.Router();

router.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { cart, subtotal, tax, shipping } = req.body;
    
    // Create line items from cart items
    const lineItems = cart.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          description: item.brand,
          images: item.image ? [`${process.env.IMAGE_URL || ''}${item.image}`] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));
    
    // Add tax as a separate line item
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax (8.25%)',
          },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }
    
    // Add shipping if applicable
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }
    
    // Create a Checkout Session with the line items
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
    });
    
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;