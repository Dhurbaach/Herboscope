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
      .get('/home', { params: { limit: 20 } })
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
    <div className="min-h-screen p-6 pb-20">
      <div className="max-w-7xl mx-auto text-white">
        
        {/* Hero Section */}
        <div className="glass-panel p-8 md:p-10 mb-8 bg-gradient-to-br from-cyan-500/20 via-emerald-500/10 to-transparent border-t border-cyan-400/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-slate-200/75 text-lg">Manage your plant database and user inquiries</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <p className="text-sm text-slate-300/75">Total Plants</p>
              <p className="text-4xl font-bold text-cyan-300">{plants.length}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/add-plant')}
            className="glass-panel p-6 hover:scale-105 transition duration-300 flex items-center gap-4 group cursor-pointer border border-emerald-400/30 hover:border-emerald-400/60 bg-gradient-to-br from-emerald-500/10 to-transparent"
          >
            <div className="p-3 rounded-lg bg-emerald-500/30 group-hover:bg-emerald-500/50 transition">
              <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">Add New Plant</p>
              <p className="text-sm text-slate-300/75">Create a new plant entry</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/inquiries')}
            className="glass-panel p-6 hover:scale-105 transition duration-300 flex items-center gap-4 group cursor-pointer border border-cyan-400/30 hover:border-cyan-400/60 bg-gradient-to-br from-cyan-500/10 to-transparent"
          >
            <div className="p-3 rounded-lg bg-cyan-500/30 group-hover:bg-cyan-500/50 transition">
              <svg className="w-6 h-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">Manage Inquiries</p>
              <p className="text-sm text-slate-300/75">Respond to user questions</p>
            </div>
          </button>
        </div>

        {/* Plants Header */}
        <div className="mb-6">
          <h2 className="page-title">Plant Database</h2>
          <p className="text-slate-200/75 mt-1">Manage and edit your plant collection</p>
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="glass-card px-6 py-4 inline-block text-cyan-100 mb-6 rounded-lg border border-cyan-400/30">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>
              Loading plants from backend...
            </div>
          </div>
        )}
        {error && (
          <div className="glass-card px-6 py-4 inline-block text-rose-100 mb-6 rounded-lg border border-rose-400/30 bg-rose-500/10">
            <p className="font-semibold">Error loading plants: {error}</p>
          </div>
        )}
      </div>

      {/* Plants Grid */}
      <div className="max-w-7xl mx-auto mb-8">
        {plants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {plants.map((plant, index) => (
              <div key={plant.id || index} className="group">
                <PlantCard
                  {...plant}
                  actions={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/edit-plant/${plant.id}`)}
                        className="flex-1 rounded-lg bg-cyan-500/80 hover:bg-cyan-500 text-white text-xs px-3 py-2 font-semibold transition"
                        disabled={deletingId === plant.id}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePlant(plant.id)}
                        className="rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white text-xs px-3 py-2 font-semibold transition"
                        disabled={deletingId === plant.id}
                      >
                        {deletingId === plant.id ? (
                          <span>•••</span>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  }
                />
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="glass-panel p-12 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-slate-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6" />
              </svg>
            </div>
            <p className="text-xl text-slate-300/75 font-semibold mb-4">No plants yet</p>
            <p className="text-slate-300/60 mb-6">Start by adding your first plant to the database</p>
            <button
              onClick={() => navigate('/add-plant')}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Add First Plant
            </button>
          </div>
        )}
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
