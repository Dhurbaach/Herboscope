import React, { useEffect, useState } from 'react';
import PlantCard from '../components/PlantCard';

export default function AdminHome({ api }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!api) {
      setLoading(false);
      return;
    }

    api
      .get('/home')
      .then((res) => {
        // The backend may return the array or an object; handle both
        const data = Array.isArray(res.data) ? res.data : res.data.plants || samplePlants;
        setPlants(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch plants');
        setLoading(false);
      });
  }, [api]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-green-300 to-teal-500 p-6">
      <div className="max-w-7xl mx-auto text-white text-center">
        <h1 className="text-4xl font-bold">Admin Home</h1>
      </div>

      <div className="max-w-6xl mx-auto mb-6 text-center text-white">
        {loading && <div className="text-yellow-200">Loading plants from backend...</div>}
        {error && <div className="text-red-200">Error loading plants: {error}</div>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plants.map((plant, index) => (
          <PlantCard key={index} {...plant} />
        ))}
      </div>
    </div>
  );
}
