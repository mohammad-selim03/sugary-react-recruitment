// src/pages/DashboardPage.tsx
import { useEffect, useRef, useState } from 'react';
import axios from '../api/axios';

const imageBaseUrl = 'https://d1wh1xji6f82aw.cloudfront.net/';

interface Material {
  Id: number;
  Title: string;
  BrandName: string;
  CoverPhoto: string;
  SalesPriceInUsd: number;
}

const DashboardPage = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [skip, setSkip] = useState(0);
  const loader = useRef<HTMLDivElement | null>(null);

  const loadMaterials = async () => {
    const filter = btoa(JSON.stringify({ Skip: skip, Limit: 20, Types: [1] }));
    const res = await axios.get(`/Materials/GetAll/?filter=${filter}`);
    setMaterials(prev => [...prev, ...res.data.Materials]);
  };

  useEffect(() => { loadMaterials(); }, [skip]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSkip(prev => prev + 20);
      }
    });

    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {materials.map(material => (
        <div key={material.Id} className="border rounded-lg shadow p-4">
          <img
            src={`${imageBaseUrl}${material.CoverPhoto}`}
            alt={material.Title}
            className="w-full h-40 object-cover rounded"
          />
          <h3 className="font-semibold text-lg mt-2">{material.Title}</h3>
          <p className="text-sm text-gray-500">{material.BrandName}</p>
          <p className="text-blue-600 font-bold">${material.SalesPriceInUsd.toFixed(2)}</p>
        </div>
      ))}
      <div ref={loader} className="h-10 col-span-full"></div>
    </div>
  );
};

export default DashboardPage;
