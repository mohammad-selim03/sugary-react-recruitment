// src/context/CartContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

interface Material {
  Id: number;
  Title: string;
  BrandName: string;
  CoverPhoto: string;
  SalesPriceInUsd: number;
}

interface CartContextType {
  cart: Material[];
  addToCart: (material: Material) => void;
  removeFromCart: (id: number) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Material[]>([]);

  const addToCart = (material: Material) => {
    setCart((prev) => [...prev, material]);
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((material) => material.Id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
