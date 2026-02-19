import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlantCard from '../components/PlantCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { useUserAuth } from '../../hooks/UserAuth';

export default function AdminHome({ api }) {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { authMessage } = useUserAuth();
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [authToastMessage, setAuthToastMessage] = useState('');

  // Capture auth message when it appears
  useEffect(() => {
    if (authMessage && !showAuthToast) {
      setAuthToastMessage(authMessage);
      setShowAuthToast(true);
    }
  }, [authMessage, showAuthToast]);

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

  const deletePlant = async (id) => {
    if (!api || !id) return;
    const confirmed = window.confirm('Delete this plant? This cannot be undone.');
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await api.delete(`/home/${id}`);
      setPlants((prev) => prev.filter((plant) => plant.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete plant');
    } finally {
      setDeletingId(null);
    }
  };

  return (<>
    <Header />
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-green-300 to-teal-500 p-6">
      <div className="max-w-7xl mx-auto text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Admin Home</h1>
          <button
            type="button"
            onClick={() => navigate('/add-plant')}
            className="rounded-lg bg-emerald-600 text-white px-5 py-2 text-sm font-semibold shadow hover:bg-emerald-700"
          >
            Add New Plant
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-6 text-center text-white">
        {loading && <div className="text-yellow-200">Loading plants from backend...</div>}
        {error && <div className="text-red-200">Error loading plants: {error}</div>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plants.map((plant, index) => (
          <div key={plant.id || index}>
            <PlantCard
              {...plant}
              actions={
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/edit-plant/${plant.id}`)}
                    className="rounded-lg bg-blue-600 text-white px-3 py-1 text-xs font-semibold shadow"
                    disabled={deletingId === plant.id}
                  >
                    Edit Plant
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePlant(plant.id)}
                    className="rounded-lg bg-red-600 text-white px-3 py-1 text-xs font-semibold shadow"
                    disabled={deletingId === plant.id}
                  >
                    {deletingId === plant.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              }
            />
          </div>
        ))}
      </div>
      {showAuthToast && (
        <Toast
          message={authToastMessage}
          type="error"
          onClose={() => setShowAuthToast(false)}
          duration={10000}
        />
      )}
    </div>
    <Footer />
  </>
  );
}
