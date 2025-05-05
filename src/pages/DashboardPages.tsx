// src/pages/DashboardPage.tsx
import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router';
import axios from '../api/axios';
import { CgSpinner } from 'react-icons/cg';  
import { CartContext } from '../context/CartContext';
import { useRef } from 'react';

const imageBaseUrl = import.meta.env.VITE_IMAGE_URL;

interface Material {
  Id: number;
  Title: string;
  BrandName: string;
  CoverPhoto: string;
  SalesPriceInUsd: number;
}

const DashboardPage = () => {
  const { cart, addToCart } = useContext(CartContext); // Cart functionality context
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const loader = useRef<HTMLDivElement | null>(null);

  const loadMaterials = async () => {
    const filter = btoa(JSON.stringify({ Skip: skip, Limit: 20, Types: [1] }));
    const res = await axios.get(`/Materials/GetAll/?filter=${filter}`);
    setMaterials((prev) => [...prev, ...res.data.Materials]);
  };

  useEffect(() => {
    loadMaterials();
  }, [skip]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSkip((prev) => prev + 20);
      }
    });

    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading... <CgSpinner className="animate-spin ml-2" />
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Left Sidebar (visible on desktop) */}
      <div className="hidden lg:block w-64 bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
        <ul>
          <li><Link to="/" className="text-gray-300 hover:text-white">Dashboard</Link></li>
          <li><Link to="/cart" className="text-gray-300 hover:text-white">Cart ({cart.length})</Link></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Top Navbar (visible on all devices) */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <div className="flex gap-4">
            <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
            <Link to="/cart" className="text-gray-700 hover:text-gray-900">Cart ({cart.length})</Link>
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {materials.map((material) => (
            <div key={material.Id} className="border border-gray-300 rounded-lg shadow overflow-hidden cursor-pointer group">
              <img
                src={`${imageBaseUrl}${material.CoverPhoto}`}
                alt={material.Title}
                className="w-full h-40 object-cover rounded group-hover:scale-105 transition-all duration-300"
              />
              <div className="p-3">
                <h3 className="font-semibold text-lg mt-2">{material.Title}</h3>
                <p className="text-sm text-gray-500">{material.BrandName}</p>
                <p className="text-blue-600 font-bold">
                  ${material.SalesPriceInUsd.toFixed(2)}
                </p>
                <button
                  onClick={() => addToCart(material)}
                  className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Lazy Loading Indicator */}
        <div ref={loader} className="h-10 col-span-full"></div>
      </div>
    </div>
  );
};

export default DashboardPage;
