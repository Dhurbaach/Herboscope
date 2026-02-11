import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!plant) return <div className="p-6">Plant not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{plant.localName}</h1>
      {plant.image ? (
        <img src={plant.image} alt={plant.localName} className="w-full h-64 object-fill" />
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded">No image</div>
      )}
      <p className="mt-4 text-sm text-gray-700">Added: {new Date(plant.createdAt).toLocaleString()}</p>
      <p className="mt-4">{plant.description || 'No description available.'}</p>
    </div>
  );
}
