import { useState, useEffect } from "react";
import { CgSpinner } from "react-icons/cg"; // For loading indicator
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router";

const Favourite = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Retrieve wishlist from localStorage when component mounts
  useEffect(() => {
    setLoading(true);
    const storedWishlist = localStorage.getItem("wishlist_items");
    if (storedWishlist) {
      try {
        setWishlist(JSON.parse(storedWishlist));
      } catch (error) {
        console.error("Error parsing wishlist", error);
      }
    }
    setLoading(false);
  }, []);

  // Function to remove item from wishlist
  const removeFromWishlist = (id: number) => {
    const updatedWishlist = wishlist.filter((item) => item.Id !== id);
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist_items", JSON.stringify(updatedWishlist));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>

      {loading ? (
        <div className="text-center mt-8">
          <CgSpinner className="animate-spin text-3xl" />
          <p className="text-gray-500">Loading your wishlist...</p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 h-60">
          <p className="text-center text-gray-500">Your wishlist is empty.</p>
          <Link to={"/materials"}><button className="bg-blue-500 px-5 py-2.5 rounded-full text-white cursor-pointer flex items-center gap-0"><FaArrowLeft className="mr-2" />Browse Materials</button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product.Id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition duration-300 overflow-hidden"
            >
              <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center cursor-pointer">
                <img
                  src={
                    `${import.meta.env.VITE_IMAGE_URL}${product.CoverPhoto}` ||
                    "/fallback.jpg"
                  }
                  alt={product.Title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/fallback.jpg";
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {product.Title}
                </h3>
                <p className="text-sm text-gray-500">{product.BrandName}</p>
                <p className="text-blue-600 font-bold mt-2">
                  ${product.SalesPriceInUsd.toFixed(2)}
                </p>

                <button
                  className="mt-3 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => removeFromWishlist(product.Id)}
                >
                  Remove from Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favourite;
