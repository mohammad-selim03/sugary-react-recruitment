// pages/MaterialDetails.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import axios from '../api/axios';
import { CgSpinner } from 'react-icons/cg';

const imageBaseUrl = import.meta.env.VITE_IMAGE_URL;

interface Material {
  Id: number;
  Title: string;
  BrandName: string;
  CoverPhoto: string;
  SalesPrice: number;
  SalesPriceInUsd: number;
  VariantTitle?: string;
  Description?: string;  // New field for product description
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
  const [material, setMaterial] = useState<Material | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);  // State for related products
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMaterial() {
      try {
        setLoading(true);
        setError(null);
        const filter = btoa(JSON.stringify({ Skip: 0, Limit: 100, Types: [1] }));
        const res = await axios.get(`/Materials/GetAll/?filter=${filter}`);
        const found = res.data.Materials.find((m: Material) => m.Id === Number(id));
        if (found) {
          setMaterial(found);
          setTags(res.data.Tags || []);
          setAreas(res.data.DeliveryAreas || []);
          setRelatedProducts(res.data.Materials.filter((m: Material) => m.BrandName === found.BrandName && m.Id !== Number(id)) || []);  // Filter related products by brand
        } else {
          setError('Material not found');
        }
      } catch (err) {
        setError('Failed to fetch material details.');
      } finally {
        setLoading(false);
      }
    }

    fetchMaterial();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading... <CgSpinner className="animate-spin ml-2" />
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

          {material.Description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{material.Description}</p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag.Id}
                  className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full cursor-pointer hover:bg-blue-200"
                >
                  {tag.Title}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Available Delivery Areas</h3>
            <ul className="list-disc pl-5 text-gray-700">
              {areas.map(area => (
                <li key={area.Id}>{area.Name}</li>
              ))}
            </ul>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Related Products</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((related) => (
                  <Link to={`/material/${related?.Id}`} key={related.Id} className="border border-gray-300 rounded-lg shadow overflow-hidden">
                    <img
                      src={`${imageBaseUrl}${related.CoverPhoto}`}
                      alt={related.Title}
                      className="w-full h-40 object-cover rounded"
                    />
                    <div className="p-3">
                      <h3 className="font-semibold text-lg mt-2">{related.Title}</h3>
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
