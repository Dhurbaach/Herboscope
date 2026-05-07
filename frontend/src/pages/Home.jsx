import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PlantCard from '../components/PlantCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PlantRecognize from './PlantRecognize';


export default function Home({ api }) {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name_asc'); // default sorting

  useEffect(() => {
    if (!api) {
      setLoading(false);
      return;
    }

    api
      .get('/home', { params: { limit: 20 } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.plants || [];
        setPlants(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch plants');
        setLoading(false);
      });
  }, [api]);

  // Sorting logic
  const sortedPlants = useMemo(() => {
    if (!plants) return [];
    const sorted = [...plants];
    switch (sortBy) {
      case 'name_asc':
        sorted.sort((a, b) => a.localName.localeCompare(b.localName));
        break;
      case 'name_desc':
        sorted.sort((a, b) => b.localName.localeCompare(a.localName));
        break;
      default:
        break;
    }
    return sorted;
  }, [plants, sortBy]);

  return (
    <>
      <Header />
      <div className="min-h-screen p-3">
        <div className="max-w-7xl mx-auto text-white text-center mb-8 relative ">
          <div className="glass-panel p-8 md:p-12 rounded-2xl">
            <h1 className="page-title">Welcome to Herboscope</h1>
            <p className="mt-3 text-base md:text-lg page-subtitle">Explore medicinal plants and their uses</p>

           
              <PlantRecognize api={api} />
            
          </div>
        </div>

        {/* Loading / Error Messages */}
        <div className="max-w-6xl mx-auto mb-6 text-center text-white">
          {loading && <div className="glass-card px-4 py-3 inline-block text-cyan-100">Loading plants from backend...</div>}
          {error && <div className="glass-card px-4 py-3 inline-block text-rose-100">Error loading plants: {error}</div>}
        </div>

        {/* Sorting Dropdown */}
        <div className="max-w-6xl mx-auto mb-6 text-right">
          <label className="mr-2 font-semibold text-slate-100">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="glass-select w-auto inline-block text-sm"
          >
            <option value="name_asc">A → Z</option>
            <option value="name_desc">Z → A</option>
          </select>
        </div>

        {/* Plant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-7xl mx-auto">
          {sortedPlants.map((plant, index) => (
            <PlantCard key={index} {...plant} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
