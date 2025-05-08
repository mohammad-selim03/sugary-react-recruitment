// pages/Dashboard.tsx
import { useEffect, useRef, useState, useMemo } from "react";
import { CgSpinner } from "react-icons/cg";
import { useNavigate } from "react-router";
import axios from "../api/axios";
import toast from "react-hot-toast";

const imageBaseUrl = import.meta.env.VITE_IMAGE_URL;

interface Material {
  Id: number;
  Title: string;
  BrandName: string;
  CoverPhoto: string;
  SalesPriceInUsd: number;
}

export default function Dashboard() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Material[]>([]);
  const loader = useRef(null);
  const navigate = useNavigate();

  const loadMaterials = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);

    try {
      const filter = btoa(
        JSON.stringify({ Skip: skip, Limit: 20, Types: [1] })
      );
      const res = await axios.get(`/Materials/GetAll/?filter=${filter}`);
      const newMaterials = res.data?.Materials || [];

      if (newMaterials.length === 0) {
        setHasMore(false); // 🛑 stop infinite fetch
      }

      setMaterials((prev) => [...prev, ...newMaterials]);
    } catch (err) {
      setError("❌ Failed to load materials. Please try again later.");
      setHasMore(false); // 🛑 stop trying more if error happens
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [skip]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setSkip((prev) => prev + 20);
        }
      },
      { threshold: 1 }
    );

    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults(materials);
      return;
    }
    const timer = setTimeout(() => {
      const lower = search.toLowerCase();
      const filtered = materials.filter(
        (m) =>
          m.Title.toLowerCase().includes(lower) ||
          m.BrandName.toLowerCase().includes(lower)
      );
      setSearchResults(filtered);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, materials]);

  const displayMaterials = useMemo(
    () => (search ? searchResults : materials),
    [search, searchResults, materials]
  );

  // add to the cart
  const handleAddToCart = (product: Material) => {
    const cartKey = "cart_items";
    const existing = localStorage.getItem(cartKey);
    let cart: Material[] = [];

    if (existing) {
      try {
        cart = JSON.parse(existing);
      } catch {
        cart = [];
      }
    }

    const alreadyInCart = cart.some((item) => item.Id === product.Id);
    if (!alreadyInCart) {
      cart.push(product);
      localStorage.setItem(cartKey, JSON.stringify(cart));
      toast.success("Product add to the cart.");
    } else {
      toast.error("Product already add to the cart.!");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Materials</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title or brand..."
          className="w-full max-w-md px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300 border-gray-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayMaterials.map((m) => (
          <div
            key={m.Id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition duration-300 overflow-hidden"
          >
            <div
              className="relative w-full h-48 bg-gray-100 flex items-center justify-center cursor-pointer"
              onClick={() => navigate(`/material/${m?.Id}`)}
            >
              {loading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <span>Loading...</span>
                  <CgSpinner className="animate-spin text-xl" />
                </div>
              ) : (
                <img
                  src={`${imageBaseUrl}${m.CoverPhoto}`}
                  alt={m.Title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/fallback.jpg";
                  }}
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {m.Title}
              </h3>
              <p className="text-sm text-gray-500">{m.BrandName}</p>
              <p className="text-blue-600 font-bold mt-2">
                ${m.SalesPriceInUsd.toFixed(2)}
              </p>

              <button
                className="mt-3 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => handleAddToCart(m)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <p className="text-center mt-4 text-gray-500 flex justify-center items-center gap-2">
          Loading more materials... <CgSpinner className="animate-spin" />
        </p>
      )}

      {!hasMore && (
        <p className="text-center mt-4 text-gray-400">
          No more materials to load.
        </p>
      )}

      <div ref={loader} className="h-10" />
    </div>
  );
}
