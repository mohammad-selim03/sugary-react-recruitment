import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Define the Material interface
interface Material {
  Id: number;
  Title: string;
  BrandName: string;
  CoverPhoto: string;
  SalesPriceInUsd: number;
  Quantity?: number;
}

// Define the context interface
interface CartContextType {
  cart: Material[];
  addToCart: (item: Material) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
}

// Create the context with default values
export const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemCount: 0,
  totalPrice: 0,
});

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Material[]>([]);
  
  // Calculate derived values
  const itemCount = cart.reduce((total, item) => total + (item.Quantity || 1), 0);
  const totalPrice = cart.reduce((total, item) => total + (item.SalesPriceInUsd * (item.Quantity || 1)), 0);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const cartKey = "cart_items";
    const storedCart = localStorage.getItem(cartKey);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        
        const cartWithQuantities = parsedCart.map((item: Material) => ({
          ...item,
          Quantity: item.Quantity || 1
        }));
        setCart(cartWithQuantities);
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        // If there's an error, initialize with an empty cart
        localStorage.setItem(cartKey, JSON.stringify([]));
      }
    }
  }, []);

  // Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (item: Material) => {
    setCart(prevCart => {
      // Checking if item already exists in cart
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.Id === item.Id);
      
      if (existingItemIndex !== -1) { 
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          Quantity: (updatedCart[existingItemIndex].Quantity || 1) + 1
        };
        return updatedCart;
      } else {
        // Item doesn't exist, add it with quantity 1
        return [...prevCart, { ...item, Quantity: 1 }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.Id !== id));
  };

  // Update item quantity
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.Id === id ? { ...item, Quantity: quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      itemCount,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;