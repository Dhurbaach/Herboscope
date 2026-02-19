import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PlantCard from '../components/PlantCard';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
      .get('/home')
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
      <div className="min-h-screen bg-gradient-to-r from-blue-400 via-orange-300 to-red-400 p-6">
        <div className="max-w-7xl mx-auto text-white text-center mb-6 relative">
          <h1 className="text-4xl font-bold">Welcome to Herboscope</h1>
          <p className="mt-2 text-lg">Explore medicinal plants and their uses</p>

          {/* Recognize Button - Top Right */}
          <button
            onClick={() => navigate('/recognize')}
            className="absolute top-0 right-0 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Recognize Plant
          </button>
        </div>

        {/* Loading / Error Messages */}
        <div className="max-w-6xl mx-auto mb-6 text-center text-white">
          {loading && <div className="text-yellow-200">Loading plants from backend...</div>}
          {error && <div className="text-red-200">Error loading plants: {error}</div>}
        </div>

        {/* Sorting Dropdown */}
        <div className="max-w-6xl mx-auto mb-6 text-right">
          <label className="mr-2 font-semibold text-white">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-1 py-0.5 rounded-lg text-black"
          >
            <option value="name_asc">A → Z</option>
            <option value="name_desc">Z → A</option>
          </select>
        </div>

        {/* Plant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {sortedPlants.map((plant, index) => (
            <PlantCard key={index} {...plant} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
