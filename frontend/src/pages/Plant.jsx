import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

export default function Plant() {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Check if plant data is in sessionStorage (newly added plant)
    const cachedPlant = sessionStorage.getItem(`plant_${id}`);
    if (cachedPlant) {
      try {
        const plantData = JSON.parse(cachedPlant);
        if (mounted) {
          setPlant(plantData);
          setLoading(false);
        }
        return;
      } catch (e) {
        console.warn('Could not parse cached plant:', e);
      }
    }

    // Otherwise fetch from API
    api
      .get(`/home/${id}`)
      .then((res) => {
        if (!mounted) return;
        setPlant(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Failed to fetch plant');
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center"><div className="text-green-600 text-lg">Loading...</div></div>;
  if (error) return <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center"><div className="text-red-500 text-lg">Error: {error}</div></div>;
  if (!plant) return <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center"><div className="text-gray-700 text-lg">Plant not found</div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Plant Image */}
          {plant.image ? (
            <div className="w-full bg-gray-200 flex items-center justify-center" style={{ maxHeight: '400px' }}>
              <img 
                src={plant.image} 
                alt={plant.localName} 
                className="max-h-96 w-auto object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-lg">No image available</span>
            </div>
          )}
          
          {/* Plant Names */}
          <div className="p-8">
            <h1 className="text-4xl font-bold text-green-800 mb-2">
              {plant.localName}
            </h1>
            {plant.scientificName && (
              <p className="text-2xl italic text-gray-600 mb-4">
                {plant.scientificName}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Added: {new Date(plant.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Description Section */}
        {plant.description && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {plant.description}
            </p>
          </div>
        )}

        {/* Uses Section */}
        {plant.uses && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Uses & Benefits
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {plant.uses}
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
