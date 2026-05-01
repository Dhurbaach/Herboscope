import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ApiResponse = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [plantData, setPlantData] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [selectedResult, setSelectedResult] = useState(0);
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

    // Fetch similar images from Google Images
    useEffect(() => {
        if (plantData && plantData.results && plantData.results.length > 0) {
            const topResult = plantData.results[selectedResult];
            if (topResult && topResult.species) {
                const query = topResult.species.scientificNameWithoutAuthor;
                fetchSimilarImages(query);
            }
        }
    }, [selectedResult, plantData]);

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

    const results = plantData.results || [];

    if (results.length === 0) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-panel p-8 text-center text-white">
                        <h1 className="text-3xl font-bold text-rose-200 mb-4">No Results Found</h1>
                        <p className="text-slate-200/80 mb-6">PlantNet could not identify the plant in the image.</p>
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

    const topResult = results[selectedResult];
    const score = (topResult.score * 100).toFixed(1);

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 glass-panel p-8 text-white">
                    <h1 className="page-title mb-2">Plant Identification Results</h1>
                    <p className="page-subtitle">Showing {results.length} possible matches</p>
                </div>

                {/* ROW 1: Uploaded Image (Left) | Details (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 lg:auto-rows-max">
                    {/* Left: Uploaded Image */}
                    {uploadedImage && (
                        <div className="glass-panel p-6 h-full text-white">
                            <h2 className="text-xl font-bold text-slate-50 mb-4">Your Uploaded Image</h2>
                            <img
                                src={uploadedImage}
                                alt="Uploaded plant"
                                className="w-full rounded-xl border border-white/10 shadow-lg"
                            />
                        </div>
                    )}

                    {/* Right: Main Details */}
                    <div className="h-full">
                        {/* Main Result Card */}
                        <div className="glass-panel overflow-hidden h-full flex flex-col text-white">
                            <div className="bg-gradient-to-r from-cyan-500/70 via-emerald-500/70 to-teal-500/70 text-white p-6">
                                <h2 className="text-3xl font-bold mb-2">{topResult.species.scientificNameWithoutAuthor}</h2>
                                {topResult.species.commonNames && topResult.species.commonNames.length > 0 && (
                                    <p className="text-cyan-50/80">Common names: {topResult.species.commonNames.join(', ')}</p>
                                )}
                            </div>

                            <div className="p-6 space-y-6 flex-grow">
                                {/* Confidence Score */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-slate-200">Match Confidence</span>
                                        <span className="text-2xl font-bold text-cyan-200">{score}%</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 h-3 rounded-full transition-all"
                                            style={{ width: `${score}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Family Information */}
                                {topResult.species.family && (
                                    <div className="pb-4 border-b border-white/10">
                                        <h3 className="font-semibold text-slate-100 mb-1">Plant Family</h3>
                                        <p className="text-slate-200/80 text-sm">{topResult.species.family.scientificNameWithoutAuthor}</p>
                                        {topResult.species.family.commonNames && topResult.species.family.commonNames.length > 0 && (
                                            <p className="text-xs text-slate-200/60 mt-1">Family: {topResult.species.family.commonNames.join(', ')}</p>
                                        )}
                                    </div>
                                )}

                                {/* Genus Information */}
                                {topResult.species.genus && (
                                    <div>
                                        <h3 className="font-semibold text-slate-100 mb-1">Genus</h3>
                                        <p className="text-slate-200/80 text-sm">{topResult.species.genus.scientificNameWithoutAuthor}</p>
                                        {topResult.species.genus.commonNames && topResult.species.genus.commonNames.length > 0 && (
                                            <p className="text-xs text-slate-200/60 mt-1">Common: {topResult.species.genus.commonNames.join(', ')}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROW 2: Matches (Left) | Similar Images (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Left: Matches List */}
                    <div className="glass-panel p-6 text-white">
                        <h2 className="text-xl font-bold text-slate-50 mb-4">All Matches</h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {results.map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedResult(index)}
                                    className={`w-full text-left p-4 rounded-xl transition border ${selectedResult === index
                                            ? 'border-cyan-300/50 bg-white/10'
                                            : 'border-white/10 bg-white/5 hover:border-cyan-300/40'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-100 text-sm">{result.species.scientificNameWithoutAuthor}</h3>
                                            {result.species.commonNames && result.species.commonNames.length > 0 && (
                                                <p className="text-xs text-slate-200/60 mt-1">{result.species.commonNames.slice(0, 2).join(', ')}</p>
                                            )}
                                        </div>
                                        <div className={`text-lg font-bold ml-2 ${selectedResult === index ? 'text-cyan-200' : 'text-emerald-200'
                                            }`}>
                                            {(result.score * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Similar Images from Wikimedia */}
                    <div className="glass-panel p-6 text-white">
                        <h2 className="text-xl font-bold text-slate-50 mb-4">Similar Images from Wikimedia</h2>
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
