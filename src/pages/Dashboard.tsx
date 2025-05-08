// pages/Dashboard.tsx
import { useEffect, useRef, useState, useMemo, useCallback, useContext } from "react";
import { CgSpinner } from "react-icons/cg";
import { useNavigate } from "react-router"; 
import axios from "axios";
import toast from "react-hot-toast";
import { CartContext } from '../context/CartContext';

// Make sure we're using the full API URL
const API_BASE_URL = "https://sugarytestapi.azurewebsites.net";
const imageBaseUrl = import.meta.env.VITE_IMAGE_URL;

interface Material {
  Id: number;
  Title: string;
  BrandName: string;
  CoverPhoto: string;
  SalesPriceInUsd: number;
}

interface ApiResponse {
  Materials: Material[];
  TotalCount: number;
}

export default function Dashboard() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Material[]>([]);
  const [totalApiCalls, setTotalApiCalls] = useState(0);
  const loader = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const isFetchingRef = useRef(false);
  const skipRef = useRef(skip);

  // Update ref when skip changes
  useEffect(() => {
    skipRef.current = skip;
  }, [skip]);

  // Using useCallback to prevent unnecessary recreations
  const loadMaterials = useCallback(async (skipValue: number) => {
    // Check if we've already made 3 API calls
    if (totalApiCalls >= 8) {
      setError("Maximum number of API calls reached. Please refresh to load more.");
      return;
    }

    // Additional checks to prevent unnecessary API calls
    if (loading || !hasMore || isFetchingRef.current) return;
  
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
  
    try {
      setTotalApiCalls(prev => prev + 1);
      
      // Try direct API call without filter first (more reliable)
      const url = `${API_BASE_URL}/Materials/GetAll`;
      console.log("Fetching data from:", url, "Skip:", skipValue);
      
      const res = await axios.get<ApiResponse>(url, {
        timeout: 10000, // 10-second timeout
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const newMaterials = res.data.Materials || [];
      
      // Apply the pagination client-side if needed
      const paginatedMaterials = newMaterials.slice(skipValue, skipValue + 20);
  
      setMaterials((prev) => [...prev, ...paginatedMaterials]);
      setHasMore(paginatedMaterials.length === 20 && paginatedMaterials.length > 0);
    } catch (err: any) {
      console.error("API Error:", err);
      setError(`Failed to load materials: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [totalApiCalls, loading, hasMore]);

  // Initial load
  useEffect(() => {
    if (totalApiCalls === 0) {
      loadMaterials(0);
    }
  }, [loadMaterials, totalApiCalls]);

  // Effect to handle skip changes - this is the key fix
  useEffect(() => {
    // Only load more if skip has changed from its initial value
    if (skip > 0) {
      loadMaterials(skip);
    }
  }, [skip, loadMaterials]);

  // Intersection observer for infinite scroll with debouncing
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Only trigger if we haven't reached API call limit
        if (entries[0].isIntersecting && hasMore && !loading && totalApiCalls < 3) {
          // Clear any existing timer
          if (debounceTimer) clearTimeout(debounceTimer);
          
          // Set a debounce timer to prevent multiple rapid calls
          debounceTimer = setTimeout(() => {
            setSkip((prev) => prev + 20);
          }, 500);
        }
      },
      { threshold: 0.2, rootMargin: "100px" }
    );

    if (loader.current) observer.observe(loader.current);
    
    return () => {
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [hasMore, loading, totalApiCalls]);

  // Search functionality
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

  // Add to cart
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
      toast.success("Product added to the cart.");
    } else {
      toast.error("Product already in the cart!");
    }
  };

  // Manual load more handler
  const handleLoadMore = () => {
    if (totalApiCalls < 5 && !loading && hasMore) {
      setSkip(prev => prev + 20);
    }
  };

  // Function to manually retry loading data
  const handleRetry = () => {
    if (totalApiCalls < 5) {
      setError(null);
      loadMaterials(skipRef.current);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Materials</h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Search by title or brand..."
          className="w-full max-w-md px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        {totalApiCalls < 5 && (
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
        )}
      </div>
      
      {totalApiCalls < 5 ? (
        <div className="text-sm text-gray-500 mb-4">
          API calls made: {totalApiCalls}/5
        </div>
      ) : (
        <div className="text-sm text-amber-600 mb-4">
          API call limit reached (3/3). Refresh page to make more calls.
        </div>
      )}

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
              <img
                src={`${imageBaseUrl}${m.CoverPhoto}` || "/fallback.jpg"}
                alt={m.Title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/fallback.jpg";
                }}
              />
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
          Loading more materials... <CgSpinner className="animate-spin text-xl" />
        </p>
      )}

      {error && (
        <div className="text-center mt-4">
          <p className="text-red-500 mb-2">{error}</p>
          {totalApiCalls < 3 && (
            <button 
              onClick={() => loadMaterials(skip)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {!hasMore && !error && materials.length > 0 && (
        <p className="text-center mt-4 text-gray-400">
          No more materials to load.
        </p>
      )}

      {hasMore && totalApiCalls < 5 && !loading && (
        <div className="flex justify-center mt-4">
          <button 
            onClick={handleLoadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Load More
          </button>
        </div>
      )}

      {totalApiCalls >= 5 && hasMore && (
        <p className="text-center mt-4 text-amber-600">
          API call limit reached. Refresh page to load more data.
        </p>
      )}

      {materials.length === 0 && !loading && !error && (
        <p className="text-center mt-8 text-gray-500">
          No materials found.
        </p>
      )}

      <div ref={loader} className="h-10" />
    </div>
  );
}