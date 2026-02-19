import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlantIcon, LoadingIcon, SuccessIcon } from '../components/Icons';
import PlantPhotoSelector from '../components/PlantPhotoSelector';
import Toast from '../components/Toast';
import uploadImage from '../utils/uploadImage';
import api from '../utils/api';

export default function AddPlant() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        plantName: '',
         scientificName: '',
         uses: '',
        description: '',
        imagePath: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [errorToastMessage, setErrorToastMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (next) => {
        setFormData(prev => ({ ...prev, ...next }));
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.plantName) {
            setErrorToastMessage('Please enter plant name');
            setShowErrorToast(true);
            return;
        }
        if (!formData.photo) {
            setErrorToastMessage('Please add a photo');
            setShowErrorToast(true);
            return;
        }

        setIsLoading(true);
        try {

            // Upload image and get URL
            const uploadRes = await uploadImage(formData.photo);
            const imageUrl= uploadRes.imageUrl;
            if (!imageUrl) {
                throw new Error('Image upload failed');
            }

            // Save plant data to backend
            const plantData = {
                plantName: formData.plantName,
                scientificName: formData.scientificName,
                uses: formData.uses,
                description: formData.description,
                imagePath: imageUrl,
            };
            const response = await api.post('/home/addPlant', plantData);
            const plantId = response.data?.plant?.id;
            
            // Show success toast
            setToastMessage('Plant added successfully!');
            setToastType('success');
            setShowToast(true);
            
            // Navigate to plant detail page after a short delay
            setTimeout(() => {
                if (plantId) {
                    navigate(`/plant/${plantId}`);
                } else {
                    navigate('/');
                }
            }, 1500);
        } catch (err) {
            console.error('Error adding plant:', err);
            setErrorToastMessage('Failed to add plant. Please try again.');
            setShowErrorToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-green-800 mb-2">Add New Plant</h1>
                    <p className="text-gray-600">Contribute to our plant database by sharing plant information and photos</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
                    <PlantPhotoSelector
                        photo={formData.photo}
                        photoPreview={formData.photoPreview}
                        onChange={handlePhotoChange}
                    />

                    {/* Form Fields */}
                    <div className="space-y-6">
                        {/* Plant Name */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Plant Name *</label>
                            <input
                                type="text"
                                name="plantName"
                                value={formData.plantName}
                                onChange={handleInputChange}
                                placeholder="e.g., Tulsi, Neem, Mint"
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition"
                                required
                            />
                        </div>

                        {/* Scientific Name */}
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

                        {/* Description */}
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

                        {/* Uses and Benefits */}
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

                    {/* Submit Button */}
                    <div className="mt-8 flex gap-3">
                        <button
                            type="submit"
                            disabled={isLoading || !formData.photo}
                            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${isLoading || !formData.photo
                                ? 'bg-gray-400 text-green-600 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <LoadingIcon className="w-5 h-5" />
                                    Adding Plant...
                                </>
                            ) : (
                                <>
                                    <SuccessIcon className="w-6 h-6" />
                                    Add Plant
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-4 py-3 bg-red-400 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Success Toast Notification */}
            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                    duration={2000}
                />
            )}
            
            {/* Error Toast Notification */}
            {showErrorToast && (
                <Toast
                    message={errorToastMessage}
                    type="error"
                    onClose={() => setShowErrorToast(false)}
                    duration={3000}
                />
            )}
        </div>
    );
}
