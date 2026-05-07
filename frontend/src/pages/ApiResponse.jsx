import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ApiResponse = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [plantData, setPlantData] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [similarImages, setSimilarImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);

    useEffect(() => {
        // Get response data from location state (passed from PlantRecognize)
        if (location.state?.response) {
            setPlantData(location.state.response);
            setUploadedImage(location.state.photoPreview || null);
        } else {
            // If no data, redirect back to recognize page
            navigate('/recognize');
        }
    }, [location, navigate]);

    const getPrimaryPrediction = (data) => {
        const confidenceValue = typeof data?.confidence === 'number'
            ? data.confidence
            : typeof data?.confidence_percentage === 'number'
                ? Number(data.confidence_percentage) / 100
                : typeof data?.confidence_percentage === 'string'
                    ? Number(data.confidence_percentage) / 100
                    : null;

        return {
            name: data?.plant_name || data?.scientific_name || 'Unknown plant',
            confidence: confidenceValue,
            scientificName: data?.scientific_name || data?.plant_name || '',
            commonNames: data?.common_name ? [data.common_name] : [],
        };
    };

    // Fetch similar images from Google Images
    useEffect(() => {
        if (!plantData) {
            return;
        }

        const query = plantData.scientific_name || plantData.plant_name || plantData.common_name;
        if (query) {
            fetchSimilarImages(query);
        }
    }, [plantData]);

    const fetchSimilarImages = async (query) => {
        setLoadingImages(true);
        try {
            const response = await api.get('/search-images', {
                params: { query }
            });
            setSimilarImages(response.data.results || []);
        } catch (error) {
            console.error('Failed to fetch similar images:', error);
            setSimilarImages([]);
        } finally {
            setLoadingImages(false);
        }
    };

    if (!plantData) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <div className="glass-card px-6 py-4 text-cyan-100 text-lg">Loading...</div>
            </div>
        );
    }

    const primaryPrediction = getPrimaryPrediction(plantData);
    const score = primaryPrediction.confidence !== null ? (primaryPrediction.confidence * 100).toFixed(1) : 'N/A';
    const sortedTopPredictions = Object.entries(plantData.all_predictions || {})
        .sort(([, firstValue], [, secondValue]) => Number(secondValue) - Number(firstValue))
        .slice(0, 5);

    if (!plantData.plant_name && !plantData.scientific_name) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-panel p-8 text-center text-white">
                        <h1 className="text-3xl font-bold text-rose-200 mb-4">No Results Found</h1>
                        <p className="text-slate-200/80 mb-6">The AI model could not identify the plant in the image.</p>
                        <button
                            onClick={() => navigate('/recognize')}
                            className="glass-button"
                        >
                            Try Another Image
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const topResult = null;

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 glass-panel p-8 text-white">
                    <h1 className="page-title mb-2">Plant Identification Results</h1>
                    <p className="page-subtitle">Showing the AI model prediction</p>
                </div>

                {/* ROW 1: Uploaded image left | Details and caption right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 lg:auto-rows-max">
                    <div className="glass-panel p-6 h-full text-white">
                        <h2 className="text-xl font-bold text-slate-50 mb-4">Your Uploaded Image</h2>
                        {uploadedImage ? (
                            <img
                                src={uploadedImage}
                                alt="Uploaded plant"
                                className="w-full rounded-xl border border-white/10 shadow-lg"
                            />
                        ) : (
                            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-slate-200/70 text-center">
                                No image available
                            </div>
                        )}
                    </div>

                    <div className="glass-panel overflow-hidden h-full flex flex-col text-white">
                        <div className="bg-gradient-to-r from-cyan-500/70 via-emerald-500/70 to-teal-500/70 text-white p-6">
                            <h2 className="text-3xl font-bold mb-2">{primaryPrediction.name}</h2>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-cyan-50/90">
                                {plantData.common_name && (
                                    <p><span className="font-semibold">Common Name:</span> {plantData.common_name}</p>
                                )}
                                {plantData.scientific_name && (
                                    <p><span className="font-semibold">Scientific Name:</span> <em>{plantData.scientific_name}</em></p>
                                )}
                                {plantData.nepali_name && (
                                    <p><span className="font-semibold">Nepali Name:</span> {plantData.nepali_name}</p>
                                )}
                            </div>
                        </div>

                        <div className="p-6 space-y-5 flex-grow">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-slate-200">Match Confidence</span>
                                    <span className="text-2xl font-bold text-cyan-200">{score}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 h-3 rounded-full transition-all"
                                        style={{ width: `${score === 'N/A' ? 0 : score}%` }}
                                    />
                                </div>
                            </div>

                            {plantData.caption && (
                                <div className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-4">
                                    <h3 className="font-semibold text-cyan-100 mb-2">Plant description</h3>
                                    <p className="text-slate-100 leading-relaxed">{plantData.caption}</p>
                                </div>
                            )}

                            {plantData.uses && Array.isArray(plantData.uses) && plantData.uses.length > 0 && (
                                <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-4">
                                    <h3 className="font-semibold text-emerald-100 mb-2">Uses</h3>
                                    <ul className="list-disc list-inside text-slate-100 space-y-1">
                                        {plantData.uses.map((use, idx) => (
                                            <li key={idx}>{use}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-4 text-amber-50/90">
                                <p className="text-xs leading-relaxed">
                                    Warning: Avoid overusing any plant remedy, and do not rely completely on AI model outputs.
                                    Please consult a qualified medical professional or botanist before use.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROW 2: Top matches left | Similar images right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="glass-panel p-6 text-white">
                        <h2 className="text-xl font-bold text-slate-50 mb-4">Top Matches</h2>
                        <div className="space-y-3">
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                <p className="text-sm text-slate-200/70 mb-1">Plant name</p>
                                <p className="font-semibold text-slate-50">{plantData.plant_name || plantData.scientific_name || 'Unknown'}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4 max-h-64 overflow-y-auto">
                                <p className="text-sm text-slate-200/70 mb-3">Top 5 predictions</p>
                                {sortedTopPredictions.length > 0 ? (
                                    <div className="space-y-2">
                                        {sortedTopPredictions.map(([name, value]) => (
                                            <div key={name} className="flex items-center justify-between gap-3 text-sm">
                                                <span className="text-slate-100">{name}</span>
                                                <span className="text-cyan-200 font-semibold">{(Number(value) * 100).toFixed(1)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-200/60 text-sm">No prediction breakdown available.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 text-white">
                        <h2 className="text-xl font-bold text-slate-50 mb-4">Similar Images from Wikipedia</h2>
                        {loadingImages && (
                            <div className="flex items-center justify-center h-96">
                                <p className="text-slate-200/70">Searching for similar images...</p>
                            </div>
                        )}
                        {!loadingImages && similarImages.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                {similarImages.map((img, idx) => (
                                    <a
                                        key={idx}
                                        href={img.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-xl overflow-hidden border border-white/10 hover:shadow-lg transition bg-white/5"
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.title || `Similar plant ${idx + 1}`}
                                            className="w-full h-32 object-cover hover:scale-110 transition"
                                            onError={(e) => (e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3EImage%3C/text%3E%3C/svg%3E')}
                                        />
                                    </a>
                                ))}
                            </div>
                        )}
                        {!loadingImages && similarImages.length === 0 && (
                            <div className="flex items-center justify-center h-96">
                                <p className="text-slate-200/60">No similar images found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Raw API Response (for debugging) */}
                <details className="glass-panel p-6 cursor-pointer hover:shadow-lg transition mb-8 text-white">
                    <summary className="font-semibold text-slate-50 select-none">Show Full API Response</summary>
                    <div className="mt-4 bg-white/5 p-4 rounded-xl overflow-auto max-h-64 border border-white/10">
                        <pre className="text-xs text-slate-200/80">
                            {JSON.stringify(plantData, null, 2)}
                        </pre>
                    </div>
                </details>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate('/recognize')}
                        className="glass-button"
                    >
                        Try Another Image
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="glass-button-secondary"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiResponse;
