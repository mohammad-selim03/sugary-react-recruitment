// pages/MaterialDetails.tsx
import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router'; // Fixed import
import axios from 'axios';
import { CgSpinner } from 'react-icons/cg';
import toast from 'react-hot-toast';
import { CartContext } from '../context/CartContext';

// Make sure we're using the full API URL
const API_BASE_URL = "https://sugarytestapi.azurewebsites.net";
const imageBaseUrl = import.meta.env.VITE_IMAGE_URL;

interface Material {
  Id: number;
  Title: string;
  BrandName: string;
  CoverPhoto: string;
  SalesPrice: number;
  SalesPriceInUsd: number;
  VariantTitle?: string;
  Description?: string;
}

interface Tag {
  Id: number;
  Title: string;
}

interface DeliveryArea {
  Id: number;
  Name: string;
}

interface RelatedProduct {
  Id: number;
  Title: string;
  SalesPriceInUsd: number;
  CoverPhoto: string;
}

export default function MaterialDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [material, setMaterial] = useState<Material | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMaterial() {
      try {
        setLoading(true);
        setError(null);

        // Direct API call to get all materials
        const url = `${API_BASE_URL}/Materials/GetAll`;
        console.log("Fetching data from:", url);
        
        const res = await axios.get(url, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        // Find the material with the matching ID
        const found = res.data.Materials.find((m: Material) => m.Id === Number(id));
        
        if (found) {
          setMaterial(found);
          // Set tags and delivery areas if available
          setTags(res.data.Tags || []);
          setAreas(res.data.DeliveryAreas || []);
          
          // Filter related products by brand
          const related = res.data.Materials.filter(
            (m: Material) => m.BrandName === found.BrandName && m.Id !== Number(id)
          ).slice(0, 4); // Limit to 4 related products
          
          setRelatedProducts(related);
        } else {
          setError('Material not found');
        }
      } catch (err: any) {
        console.error("API Error:", err);
        setError(`Failed to fetch material details: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchMaterial();
    }
  }, [id]);

  // Add to cart handler
  const handleAddToCart = () => {
    if (!material) return;
    
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

    const alreadyInCart = cart.some((item) => item.Id === material.Id);
    
    if (!alreadyInCart) {
      cart.push(material);
      localStorage.setItem(cartKey, JSON.stringify(cart));
      toast.success(`${material.Title} added to the cart.`);
      
      // Use context if available
      if (addToCart) {
        addToCart(material);
      }
    } else {
      toast.error("Product already in the cart!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <CgSpinner className="animate-spin text-2xl mr-2" /> Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">
        {error} <br />
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!material) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        onClick={() => navigate(-1)}
      >
        Back
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <img
          src={`${imageBaseUrl}${material.CoverPhoto}`}
          alt={material.Title}
          className="w-full h-80 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/fallback.jpg";
          }}
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{material.Title}</h1>
          {material.VariantTitle && (
            <p className="text-md text-gray-600 mb-1">Variant: {material.VariantTitle}</p>
          )}
          <p className="text-gray-700 mb-4">Brand: {material.BrandName}</p>
          <p className="text-2xl font-semibold text-blue-600">
            ${material.SalesPriceInUsd.toFixed(2)} USD
          </p>

          {/* Add to cart button */}
          <button
            className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 flex items-center transition-colors"
            onClick={handleAddToCart}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
            Add to Cart
          </button>

          {material.Description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{material.Description}</p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.length > 0 ? (
                tags.map(tag => (
                  <span
                    key={tag.Id}
                    className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full cursor-pointer hover:bg-blue-200"
                  >
                    {tag.Title}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">No tags available</span>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Available Delivery Areas</h3>
            {areas.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-700">
                {areas.map(area => (
                  <li key={area.Id}>{area.Name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No delivery areas available</p>
            )}
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Related Products</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((related) => (
                  <Link to={`/material/${related.Id}`} key={related.Id} className="border border-gray-300 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
                    <img
                      src={`${imageBaseUrl}${related.CoverPhoto}`}
                      alt={related.Title}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/fallback.jpg";
                      }}
                    />
                    <div className="p-3">
                      <h3 className="font-semibold text-sm truncate">{related.Title}</h3>
                      <p className="text-blue-600 font-bold">${related.SalesPriceInUsd.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}