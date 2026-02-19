import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useUserAuth } from '../../hooks/UserAuth';

const ApiResponse = () => {
    const {authmessage}=useUserAuth;
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
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                <div className="text-green-600 text-lg">Loading...</div>
            </div>
        );
    }

    const results = plantData.results || [];

    if (results.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <h1 className="text-3xl font-bold text-red-600 mb-4">No Results Found</h1>
                        <p className="text-gray-600 mb-6">PlantNet could not identify the plant in the image.</p>
                        <button
                            onClick={() => navigate('/recognize')}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-green-800 mb-2">Plant Identification Results</h1>
                    <p className="text-gray-600">Showing {results.length} possible matches</p>
                </div>

                {/* ROW 1: Uploaded Image (Left) | Details (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 lg:auto-rows-max">
                    {/* Left: Uploaded Image */}
                    {uploadedImage && (
                        <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Uploaded Image</h2>
                            <img
                                src={uploadedImage}
                                alt="Uploaded plant"
                                className="w-full rounded-lg border-2 border-green-300 shadow-lg"
                            />
                        </div>
                    )}

                    {/* Right: Main Details */}
                    <div className="h-full">
                        {/* Main Result Card */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full flex flex-col">
                            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
                                <h2 className="text-3xl font-bold mb-2">{topResult.species.scientificNameWithoutAuthor}</h2>
                                {topResult.species.commonNames && topResult.species.commonNames.length > 0 && (
                                    <p className="text-green-100">Common names: {topResult.species.commonNames.join(', ')}</p>
                                )}
                            </div>

                            <div className="p-6 space-y-6 flex-grow">
                                {/* Confidence Score */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-gray-700">Match Confidence</span>
                                        <span className="text-2xl font-bold text-green-600">{score}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-green-600 h-3 rounded-full transition-all"
                                            style={{ width: `${score}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Family Information */}
                                {topResult.species.family && (
                                    <div className="pb-4 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-800 mb-1">Plant Family</h3>
                                        <p className="text-gray-700 text-sm">{topResult.species.family.scientificNameWithoutAuthor}</p>
                                        {topResult.species.family.commonNames && topResult.species.family.commonNames.length > 0 && (
                                            <p className="text-xs text-gray-600 mt-1">Family: {topResult.species.family.commonNames.join(', ')}</p>
                                        )}
                                    </div>
                                )}

                                {/* Genus Information */}
                                {topResult.species.genus && (
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-1">Genus</h3>
                                        <p className="text-gray-700 text-sm">{topResult.species.genus.scientificNameWithoutAuthor}</p>
                                        {topResult.species.genus.commonNames && topResult.species.genus.commonNames.length > 0 && (
                                            <p className="text-xs text-gray-600 mt-1">Common: {topResult.species.genus.commonNames.join(', ')}</p>
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
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">All Matches</h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {results.map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedResult(index)}
                                    className={`w-full text-left p-4 rounded-lg transition border-2 ${selectedResult === index
                                            ? 'border-green-600 bg-green-50'
                                            : 'border-gray-300 bg-white hover:border-green-400'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 text-sm">{result.species.scientificNameWithoutAuthor}</h3>
                                            {result.species.commonNames && result.species.commonNames.length > 0 && (
                                                <p className="text-xs text-gray-600 mt-1">{result.species.commonNames.slice(0, 2).join(', ')}</p>
                                            )}
                                        </div>
                                        <div className={`text-lg font-bold ml-2 ${selectedResult === index ? 'text-green-600' : 'text-green-500'
                                            }`}>
                                            {(result.score * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Similar Images from Wikimedia */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Similar Images from Wikimedia</h2>
                        {loadingImages && (
                            <div className="flex items-center justify-center h-96">
                                <p className="text-gray-600">Searching for similar images...</p>
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
                                        className="rounded-lg overflow-hidden border border-gray-300 hover:shadow-lg transition"
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
                                <p className="text-gray-500">No similar images found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Raw API Response (for debugging) */}
                <details className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer hover:shadow-lg transition mb-8">
                    <summary className="font-semibold text-gray-800 select-none">Show Full API Response</summary>
                    <div className="mt-4 bg-gray-100 p-4 rounded-lg overflow-auto max-h-64">
                        <pre className="text-xs text-gray-700">
                            {JSON.stringify(plantData, null, 2)}
                        </pre>
                    </div>
                </details>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate('/recognize')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                        Try Another Image
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiResponse;
