import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  useContext,
} from "react";
import { CgSpinner } from "react-icons/cg";
import { BsEye, BsHeart, BsHeartFill, BsShare } from "react-icons/bs"; // Wishlist Icons
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { CartContext } from "../context/CartContext";

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

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Material[]>([]);
  const [totalApiCalls, setTotalApiCalls] = useState(0);
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

  const loader = useRef(null);
  const navigate = useNavigate();

  const { addToCart } = useContext(CartContext);

  const isFetchingRef = useRef(false);
  const skipRef = useRef(skip);

  // Update ref when skip changes
  useEffect(() => {
    skipRef.current = skip;
  }, [skip]);

  const loadMaterials = useCallback(
    async (skipValue: number) => {
      if (totalApiCalls >= 8) {
        setError(
          "Maximum number of API calls reached. Please refresh to load more."
        );
        return;
      }

      if (loading || !hasMore || isFetchingRef.current) return;

      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        setTotalApiCalls((prev) => prev + 1);

        const url = `${API_BASE_URL}/Materials/GetAll`;
        console.log("Fetching data from:", url, "Skip:", skipValue);

        const res = await axios.get<ApiResponse>(url, {
          timeout: 10000,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        const newMaterials = res.data.Materials || [];
        const paginatedMaterials = newMaterials.slice(
          skipValue,
          skipValue + 20
        );

        setMaterials((prev) => [...prev, ...paginatedMaterials]);
        setHasMore(
          paginatedMaterials.length === 20 && paginatedMaterials.length > 0
        );
      } catch (err: any) {
        console.error("API Error:", err);
        setError(`Failed to load materials: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [totalApiCalls, loading, hasMore]
  );

  useEffect(() => {
    if (totalApiCalls === 0) {
      loadMaterials(0);
    }
  }, [loadMaterials, totalApiCalls]);

  useEffect(() => {
    if (skip > 0) {
      loadMaterials(skip);
    }
  }, [skip, loadMaterials]);

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loading &&
          totalApiCalls < 3
        ) {
          if (debounceTimer) clearTimeout(debounceTimer);
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

  // Wishlist Handling
  const toggleWishlist = (product: Material) => {
    const wishlistKey = "wishlist_items";
    let wishlist: Material[] = JSON.parse(
      localStorage.getItem(wishlistKey) || "[]"
    );

    const isInWishlist = wishlist.some((item) => item.Id === product.Id);
    if (isInWishlist) {
      wishlist = wishlist.filter((item) => item.Id !== product.Id);
      toast.success("Removed from Wishlist");
    } else {
      wishlist.push(product);
      toast.success("Added to Wishlist");
    }

    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
  };

  // Add to Cart
  //   const handleAddToCart = (product: Material) => {
  //     const cartKey = "cart_items";
  //     const existing = localStorage.getItem(cartKey);
  //     let cart: Material[] = [];

  //     if (existing) {
  //       try {
  //         cart = JSON.parse(existing);
  //       } catch {
  //         cart = [];
  //       }
  //     }

  //     const alreadyInCart = cart.some((item) => item.Id === product.Id);
  //     if (!alreadyInCart) {
  //       cart.push(product);
  //       localStorage.setItem(cartKey, JSON.stringify(cart));
  //       toast.success("Product added to the cart.");
  //     } else {
  //       toast.error("Product already in the cart!");
  //     }
  //   };
  const handleAddToCart = (product: Material) => {
    const cartKey = "cart_items";
    let cart: any[] = JSON.parse(localStorage.getItem(cartKey) || "[]");

    const existingIndex = cart.findIndex((item) => item.Id === product.Id);

    if (existingIndex !== -1) {
      // Update quantity
      cart[existingIndex].quantity += 1;
    } else {
      // Add new product with quantity
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    toast.success("Product added to the cart.");
  };

  const getCartQuantity = (productId: number): number => {
    const cart = JSON.parse(localStorage.getItem("cart_items") || "[]");
    const product = cart.find((item: any) => item.Id === productId);
    return product ? product.quantity : 0;
  };

  const updateQuantity = (product: Material, delta: number) => {
    const cartKey = "cart_items";
    let cart: any[] = JSON.parse(localStorage.getItem(cartKey) || "[]");

    const index = cart.findIndex((item) => item.Id === product.Id);
    if (index !== -1) {
      cart[index].quantity += delta;

      if (cart[index].quantity <= 0) {
        cart.splice(index, 1); // remove product if quantity is 0
      }

      localStorage.setItem(cartKey, JSON.stringify(cart));
      toast.success("Cart updated!");
      setMaterials([...materials]); // trigger re-render
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Materials</h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Search by title or brand..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayMaterials.map((m) => {
          const quantity = getCartQuantity(m.Id);
          const isHovered = hoveredCardId === m.Id;

          return (
            <div
              key={m.Id}
              className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden relative group"
              onMouseEnter={() => setHoveredCardId(m.Id)}
              onMouseLeave={() => setHoveredCardId(null)}
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

                {/* Hover icons */}
                <div
                  className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-3 transition-all duration-300 ${
                    isHovered
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }`}
                >
                  <button
                    className="bg-white p-2 rounded-full shadow hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("View");
                    }}
                  >
                    <BsEye />
                  </button>
                  <button
                    className="bg-white p-2 rounded-full shadow hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Share");
                    }}
                  >
                    <BsShare />
                  </button>
                  <button
                    className="bg-white p-2 rounded-full shadow hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(m);
                      setMaterials([...materials]); // trigger re-render
                    }}
                  >
                    {JSON.parse(
                      localStorage.getItem("wishlist_items") || "[]"
                    ).some((item: Material) => item.Id === m.Id) ? (
                      <BsHeartFill className="text-red-400" />
                    ) : (
                      <BsHeart />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4">
                <p className="text-sm text-gray-500">Snacks</p>
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {m.Title}
                </h3>
                <p className="text-gray-400 line-through text-sm">
                  ${(m.SalesPriceInUsd * 1.1).toFixed(2)}
                </p>
                <p className="text-blue-600 font-bold text-lg">
                  ${m.SalesPriceInUsd.toFixed(2)}
                </p>
                {quantity > 0 ? (
                  <>
                    <div className="flex items-center justify-between mt-4">
                      <span>Quantity</span>
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1 border border-gray-300 cursor-pointer hover:bg-gray-100 rounded-full"
                          onClick={() => updateQuantity(m, -1)}
                        >
                          -
                        </button>
                        <span>{quantity}</span>
                        <button
                          className="px-3 py-1 border border-gray-300 cursor-pointer hover:bg-gray-100 rounded-full"
                          onClick={() => updateQuantity(m, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 font-semibold">
                      <span>Subtotal</span>
                      <span>${(quantity * m.SalesPriceInUsd).toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <button
                    className="mt-3 w-full px-3 py-2 border border-green-500 hover:text-white transition-all duration-300 cursor-pointer rounded hover:bg-green-600"
                    onClick={() => {
                      handleAddToCart(m);
                      setMaterials([...materials]);
                    }}
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <p className="text-center mt-4 text-gray-500 flex justify-center items-center h-80 gap-2">
          Loading more materials...{" "}
          <CgSpinner className="animate-spin text-xl" />
        </p>
      )}

      {error && (
        <div className="text-center mt-4">
          <p className="text-red-500 mb-2">{error}</p>
        </div>
      )}
      {hasMore && !loading && !error && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setSkip(skip + 20)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
