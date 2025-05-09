import React, { useContext, useEffect, useState } from 'react';
import {
  FaBoxOpen,
  FaHeart,
  FaShoppingCart,
  FaClipboardList
} from 'react-icons/fa';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CartContext } from '../context/CartContext';

const Dashboard = () => {
  const { itemCount } = useContext(CartContext);

  const [totalProducts, setTotalProducts] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => { 
    const wishlist = JSON.parse(localStorage.getItem('wishlist_items') || '[]');
    setWishlistCount(wishlist.length);

    // Set total products from your materials array length or an API 
    const materials = JSON.parse(localStorage.getItem('materials') || '[]');
    setTotalProducts(materials.length);

    // Fake order data, replace with real API later
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrderCount(orders.length);
  }, []);

  const pieData = [
    // { name: 'Cart Items', value: itemCount },
    { name: 'Wishlist Items', value: wishlistCount },
    { name: 'Orders', value: orderCount }
  ];

  const COLORS = ['#34D399', '#F472B6', '#FBBF24'];

  return (
    <div className="min-h-screen bg-gradient-to-br   to-white p-0 py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10 drop-shadow-sm">
        Products Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card
          title="Total Products"
          count={totalProducts}
          icon={<FaBoxOpen />}
          color="text-indigo-500"
        />
        <Card
          title="Cart Items"
          count={itemCount}
          icon={<FaShoppingCart />}
          color="text-green-500"
        />
        <Card
          title="Wishlist Items"
          count={wishlistCount}
          icon={<FaHeart />}
          color="text-pink-500"
        />
        <Card
          title="Total Orders"
          count={orderCount}
          icon={<FaClipboardList />}
          color="text-yellow-500"
        />
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          Product Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

const Card = ({ title, count, icon, color }: CardProps) => (
  <div className="bg-white flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl p-6 text-center border border-gray-100 hover:-translate-y-2">
    <div className={`text-4xl mb-3 ${color}`}>{icon}</div>
    <h2 className="text-lg font-semibold text-gray-600">{title}</h2>
    <p className="text-3xl font-bold text-gray-900">{count}</p>
  </div>
);

export default Dashboard;
