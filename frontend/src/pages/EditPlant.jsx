import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import Toast from '../components/Toast';
import { PlantIcon, LoadingIcon, SuccessIcon } from '../components/Icons';

const EditPlant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    plantName: '',
    scientificName: '',
    uses: '',
    description: '',
    image: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!id) {
      setErrorMessage('Missing plant id');
      setShowErrorToast(true);
      setLoading(false);
      return;
    }

    const fetchPlant = async () => {
      try {
        const res = await api.get(`/home/${id}`);
        const data = res.data || {};
        setFormData({
          plantName: data.localName || data.plantName || '',
          scientificName: data.scientificName || '',
          uses: data.uses || '',
          description: data.description || '',
          image: data.image || '',
        });
      } catch (err) {
        setErrorMessage(err.message || 'Failed to fetch plant data');
        setShowErrorToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPlant();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setErrorMessage(null);
    try {
      await api.patch(`/home/${id}`, {
        plantName: formData.plantName,
        scientificName: formData.scientificName,
        uses: formData.uses,
        description: formData.description,
      });
      setSuccessMessage('Plant updated successfully!');
      setShowSuccessToast(true);
      
      // Navigate after showing success toast
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update plant');
      setShowErrorToast(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <LoadingIcon className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Edit Plant</h1>
          <p className="text-gray-600">Update plant information</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Plant Photo</h2>
            {formData.image ? (
              <img
                src={formData.image}
                alt={formData.plantName || 'Plant'}
                className="w-full max-h-80 rounded-lg object-cover border-2 border-green-300"
              />
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center text-gray-500">
                No image available
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Plant Name</label>
              <input
                type="text"
                name="plantName"
                value={formData.plantName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Scientific Name</label>
              <input
                type="text"
                name="scientificName"
                value={formData.scientificName}
                onChange={handleInputChange}
                placeholder="e.g., Ocimum tenuiflorum"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the plant, its appearance, habitat, and characteristics..."
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Uses & Benefits</label>
              <textarea
                name="uses"
                value={formData.uses}
                onChange={handleInputChange}
                placeholder="List medicinal uses, culinary applications, and health benefits..."
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition resize-none"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                saving ? 'bg-gray-400 text-green-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {saving ? (
                <>
                  <LoadingIcon className="w-5 h-5" />
                  Saving...
                </>
              ) : (
                <>
                  <SuccessIcon className="w-6 h-6" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-3 bg-red-400 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      
      {/* Success Toast */}
      {showSuccessToast && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setShowSuccessToast(false)}
          duration={1500}
        />
      )}
      
      {/* Error Toast */}
      {showErrorToast && (
        <Toast
          message={errorMessage}
          type="error"
          onClose={() => setShowErrorToast(false)}
          duration={3000}
        />
      )}
    </div>
  );
};

export default EditPlant;
