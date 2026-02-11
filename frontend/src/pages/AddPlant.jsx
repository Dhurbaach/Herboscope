import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlantIcon, CameraIcon, UploadIcon, CrossIcon, LoadingIcon, SuccessIcon } from '../components/Icons';

export default function AddPlant() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        plantName: '',
        scientificName: '',
        description: '',
        uses: '',
        photo: null,
        photoPreview: null
    });

    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Attach stream to video when it becomes available
    useEffect(() => {
        if (showCamera && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [showCamera, stream]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle file upload from computer
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({
                    ...prev,
                    photo: file,
                    photoPreview: event.target?.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Start camera
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });
            setStream(mediaStream);
            setShowCamera(true);
        } catch (err) {
            alert('Unable to access camera: ' + err.message);
        }
    };

    // Capture photo from camera
    const capturePhoto = () => {
        if (!canvasRef.current || !videoRef.current) {
            alert('Camera not ready');
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
            alert('Could not get canvas context');
            return;
        }

        // Ensure video has loaded
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            alert('Video not ready yet. Please wait a moment and try again.');
            return;
        }

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the current video frame on canvas
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        // Convert canvas to blob and create preview
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File(
                    [blob],
                    `plant-capture-${Date.now()}.jpg`,
                    { type: 'image/jpeg' }
                );
                const preview = canvas.toDataURL('image/jpeg');

                setFormData(prev => ({
                    ...prev,
                    photo: file,
                    photoPreview: preview || null,
                }));

                stopCamera();
            }
        }, 'image/jpeg', 0.9);
    };

    // Stop camera
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    // Cleanup stream on component unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Remove photo
    const removePhoto = () => {
        setFormData(prev => ({
            ...prev,
            photo: null,
            photoPreview: null
        }));
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.plantName) {
            alert('Please enter plant name');
            return;
        }
        if (!formData.photo) {
            alert('Please add a photo');
            return;
        }

        setIsLoading(true);
        try {
            // Create FormData for multipart upload
            const fd = new FormData();
            fd.append('plantName', formData.plantName);
            fd.append('scientificName', formData.scientificName);
            fd.append('description', formData.description);
            fd.append('uses', formData.uses);
            fd.append('photo', formData.photo);

            // // // Send to backend (adjust endpoint as needed)
            // // const response = await fetch('/api/plants', {
            // //     method: 'POST',
            // //     body: fd
            // // });

            // if (!response.ok) throw new Error('Failed to add plant');

            // const responseData = await response.json();
            // const plantId = responseData?.plant?.id || responseData?.id || Date.now();
            // Send to backend in background (don't wait for response)

            // Generate plant ID for immediate display
            const plantId = Date.now();

            // Store plant data in sessionStorage for immediate display on Plant page
            const plantData = {
                id: plantId,
                localName: formData.plantName,
                scientificName: formData.scientificName,
                description: formData.description,
                uses: formData.uses,
                image: formData.photoPreview
            };
            sessionStorage.setItem(`plant_${plantId}`, JSON.stringify(plantData));

            setSuccessMessage('Plant added successfully! Redirecting...');

            // Navigate to plant details page after a brief delay
            setTimeout(() => {
                navigate(`/plant/${plantId}`);
            }, 800);
        } catch (err) {
            alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <PlantIcon className="w-20 h-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-green-800 mb-2">Add New Plant</h1>
                    <p className="text-gray-600">Contribute to our plant database by sharing plant information and photos</p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-600 text-green-700 rounded">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Photo Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><CameraIcon className="w-7 h-7 mr-2" /> Plant Photo</h2>

                        {formData.photoPreview ? (
                            // Photo Preview
                            <div className="relative mb-4">
                                <img src={formData.photoPreview} alt="Plant preview" className="w-full max-h-80 rounded-lg object-cover border-2 border-green-300" />
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    <CrossIcon className="w-5 h-5 mr-1 inline" />Remove
                                </button>
                            </div>
                        ) : (
                            // Photo Options
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Upload from Computer */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-6 border-2 border-dashed border-green-400 rounded-lg hover:border-green-600 hover:bg-green-50 transition text-center"
                                >
                                    <div className="flex justify-center mb-2">
                                        <UploadIcon className="w-10 h-10" />
                                    </div>
                                    <div className="font-semibold text-gray-800">Upload Photo</div>
                                    <div className="text-sm text-gray-600">From your computer</div>
                                </button>

                                {/* Take Photo with Camera */}
                                <button
                                    type="button"
                                    onClick={startCamera}
                                    className="p-6 border-2 border-dashed border-blue-400 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center"
                                >
                                    <div className="flex justify-center mb-2">
                                        <CameraIcon className="w-10 h-10" />
                                    </div>
                                    <div className="font-semibold text-gray-800">Take Photo</div>
                                    <div className="text-sm text-gray-600">Using your camera</div>
                                </button>
                            </div>
                        )}

                        {/* Hidden File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {/* Camera Modal */}
                        {showCamera && (
                            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                                    <h3 className="text-xl font-bold mb-4 flex items-center"><CameraIcon className="w-6 h-6 mr-2" /> Take Photo</h3>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        style={{ width: '100%', borderRadius: '0.5rem', backgroundColor: '#000', marginBottom: '1rem' }}
                                    />
                                    <canvas ref={canvasRef} className="hidden" />
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={capturePhoto}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center"
                                        >
                                            <CameraIcon className="w-5 h-5 mr-2" /> Capture Photo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={stopCamera}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

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
        </div>
    );
}
