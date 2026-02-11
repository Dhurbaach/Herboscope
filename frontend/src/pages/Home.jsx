import React, { useEffect, useState, useMemo } from 'react';
import PlantCard from '../components/PlantCard';

export default function Home({ api }) {
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
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-green-300 to-teal-500 p-6">
      <div className="max-w-7xl mx-auto text-white text-center mb-6">
        <h1 className="text-4xl font-bold">Welcome to Herboscope</h1>
        <p className="mt-2 text-lg">Explore medicinal plants and their uses</p>
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
          defaultValue="name_asc"
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
  );
}
