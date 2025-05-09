import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import stripeRoutes from './stripeRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// For webhook endpoint only - raw body for signature verification
app.use('/api/webhook', express.raw({ type: 'application/json' }));

// Standard middleware
app.use(cors());

// Parse JSON for all other routes
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Use the Stripe routes
app.use(stripeRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Get directory name in ES module
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  
  // Serve static files from the client build folder
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Any route not handled by API should serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;