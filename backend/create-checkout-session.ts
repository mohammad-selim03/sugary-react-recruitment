// Backend implementation for Stripe checkout
import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Create checkout session
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
    
    // Store the order details in the metadata
    const metadata = {
      orderId: `order_${Date.now()}`,
      items: JSON.stringify(cart.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price
      })))
    };

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
      metadata: metadata,
      // Optional: if you have a customer database
      // customer_email: req.user?.email,
    });
    
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Retrieve session (for order success page)
router.get('/api/checkout-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items', 'customer']
    });
    
    res.status(200).json(session);
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    res.status(500).json({ message: error.message });
  }
});

// Webhook to handle Stripe events (like successful payments)
router.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const payload = req.body;
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Verify webhook signature and extract the event
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Here you could:
        // 1. Fulfill the order (e.g., update database)
        // 2. Send confirmation email
        // 3. Track inventory updates
        
        console.log(`Payment successful for order: ${session.metadata.orderId}`);
        
        // You would implement your order processing logic here
        // await fulfillOrder(session);
        
        break;
        
      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object;
        console.log(`Payment failed: ${paymentIntent.last_payment_error?.message}`);
        
        // You could implement logic to handle failed payments
        // await handleFailedPayment(paymentIntent);
        
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;