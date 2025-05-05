import { useEffect, useRef, useState } from 'react';
import axios from '../api/axios';

const imageBaseUrl = 'https://d1wh1xji6f82aw.cloudfront.net/';

export default function Dashboard() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [skip, setSkip] = useState(0);
  const loader = useRef(null);

  const loadMaterials = async () => {
    const filter = btoa(JSON.stringify({ Skip: skip, Limit: 20, Types: [1] }));
    const res = await axios.get(`/Materials/GetAll/?filter=${filter}`);
    setMaterials(prev => [...prev, ...res.data.Materials]);
  };

  useEffect(() => {
    loadMaterials();
  }, [skip]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setSkip(prev => prev + 20);
      }
    }, { threshold: 1 });

    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {materials.map((m, i) => (
        <div key={i} className="border rounded shadow p-2">
          <img src={`${imageBaseUrl}${m.CoverPhoto}`} alt={m.Title} className="w-full h-40 object-cover" />
          <h3 className="font-bold">{m.Title}</h3>
          <p>{m.BrandName}</p>
          <p>${m.SalesPriceInUsd}</p>
        </div>
      ))}
      <div ref={loader} className="h-10"></div>
    </div>
  );
}
