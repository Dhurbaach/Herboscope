import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlantPhotoSelector from '../components/PlantPhotoSelector';
import { LoadingIcon } from '../components/Icons';
import api from '../utils/api';
import Toast from '../components/Toast';

const PlantRecognize = () => {
    const navigate = useNavigate();
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const [showErrorToast, setShowErrorToast] = useState(false);
    const [errorToastMessage, setErrorToastMessage] = useState('');
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [successToastMessage, setSuccessToastMessage] = useState('');

    const handlePhotoChange = (next) => {
        setPhoto(next.photo || null);
        setPhotoPreview(next.photoPreview || null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!photo) {
            setErrorToastMessage('Please add a photo');
            setShowErrorToast(true);
            return;
        }
        setLoading(true);
        try {
            const form = new FormData();
            form.append('image', photo);
            form.append('organ', 'leaf');
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
                setErrorToastMessage('No plant matches found. Try a different image or angle.');
                setShowErrorToast(true);
            }
        } catch (err) {
            console.error('Error recognizing plant:', err);
            const errorMsg = err?.response?.data?.message || err.message || 'Unknown error';
            setErrorToastMessage('Failed to recognize plant. Please try again.\n' + errorMsg);
            setShowErrorToast(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-2">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                {/* <div className="text-center mb-8 glass-panel p-8">
                    <h1 className="page-title mb-2">Identify a Plant</h1>
                    <p className="page-subtitle">Upload a plant image to recognize it using AI</p>
                </div> */}

                <form onSubmit={handleSubmit} className="p-4 text-white">
                    <PlantPhotoSelector
                        photo={photo}
                        photoPreview={photoPreview}
                        onChange={handlePhotoChange}
                    />

                    {/* Submit Button */}
                    <div className="mt-8 flex gap-3">
                        <button
                            type="submit"
                            disabled={loading || !photo}
                            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${loading || !photo
                                ? 'bg-white/10 text-slate-300 cursor-not-allowed border border-white/10'
                                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-600 hover:via-teal-600 hover:to-green-600 text-white shadow-lg hover:shadow-emerald-500/50'
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
                    </div>
                </form>
            </div>
            {/* Error Toast */}
            {showErrorToast && (
                <Toast
                    message={errorToastMessage}
                    type="error"
                    onClose={() => setShowErrorToast(false)}
                    duration={5000}
                />
            )}
            {/* Success Toast */}
            {showSuccessToast && (
                <Toast
                    message={successToastMessage}
                    type="success"
                    onClose={() => setShowSuccessToast(false)}
                    duration={3000}
                />
            )}
        </div>
    );
};

export default PlantRecognize;