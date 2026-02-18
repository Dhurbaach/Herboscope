import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlantPhotoSelector from '../components/PlantPhotoSelector';
import { LoadingIcon } from '../components/Icons';
import api from '../utils/api';

const PlantRecognize = () => {
    const navigate = useNavigate();
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [organName, setOrganName] = useState('leaf'); // default to leaf if not specified

    const handlePhotoChange = (next) => {
        setPhoto(next.photo || null);
        setPhotoPreview(next.photoPreview || null);
    };

    const handleInputChange = (e) => {
        setOrganName(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!photo) {
            alert('Please add a photo');
            return;
        }
        setLoading(true);
        try {
            const form = new FormData();
            form.append('image', photo);
            form.append('organ', organName);
            // Call backend API to identify plant
            const response = await api.post('/identify', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            const data = response.data;
            console.log('Backend response:', data);
            
            // Check if we got results from PlantNet
            if (data.results && data.results.length > 0) {
                const topResult = data.results[0];
                console.log('Top match:', topResult.species.scientificNameWithoutAuthor);
                console.log('Score:', topResult.score);
                
                // Navigate to results page with response data and uploaded image
                navigate('/api-response', { state: { response: data, photoPreview } });
            } else {
                alert('No plant matches found. Try a different image or angle.');
            }
        } catch (err) {
            console.error('Error recognizing plant:', err);
            const errorMsg = err?.response?.data?.message || err.message || 'Unknown error';
            alert('Failed to recognize plant. Please try again.\n' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-green-800 mb-2">Identify a Plant</h1>
                    <p className="text-gray-600">Upload a plant image to recognize it using AI</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
                    <PlantPhotoSelector
                        photo={photo}
                        photoPreview={photoPreview}
                        onChange={handlePhotoChange}
                    />

                    <div className="space-y-6 mt-6">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Plant Organ  (Optional)</label>
                            <input
                                type="text"
                                name="organName"
                                value={organName}
                                onChange={handleInputChange}
                                placeholder="e.g. Flower, Leaf, Fruit (if known)"
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition"
                            />
                            <p className="mt-1 text-sm text-gray-500">If you know the plant organ, enter it here for better results</p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 flex gap-3">
                        <button
                            type="submit"
                            disabled={loading || !photo}
                            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${loading || !photo
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <LoadingIcon className="w-5 h-5" />
                                    Recognizing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Recognize Plant
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlantRecognize;