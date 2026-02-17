import React, { useEffect, useRef, useState } from 'react';
import { CameraIcon, UploadIcon, CrossIcon } from './Icons';

const PlantPhotoSelector = ({ photo, photoPreview, onChange }) => {
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        if (showCamera && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [showCamera, stream]);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [stream]);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = event.target?.result || null;
            if (onChange) {
                onChange({ photo: file, photoPreview: preview });
            }
        };
        reader.readAsDataURL(file);
    };

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

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

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

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            alert('Video not ready yet. Please wait a moment and try again.');
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        canvas.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], `plant-capture-${Date.now()}.jpg`, {
                type: 'image/jpeg',
            });
            const preview = canvas.toDataURL('image/jpeg');
            if (onChange) {
                onChange({ photo: file, photoPreview: preview || null });
            }
            stopCamera();
        }, 'image/jpeg', 0.9);
    };

    const removePhoto = () => {
        if (onChange) {
            onChange({ photo: null, photoPreview: null });
        }
    };

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <CameraIcon className="w-7 h-7 mr-2" /> Plant Photo
            </h2>

            {photoPreview ? (
                <div className="relative mb-4">
                    <img
                        src={photoPreview}
                        alt="Plant preview"
                        className="w-full max-h-80 rounded-lg object-cover border-2 border-green-300"
                    />
                    <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        <CrossIcon className="w-5 h-5 mr-1 inline" />Remove
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {showCamera ? (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                            <CameraIcon className="w-6 h-6 mr-2" /> Take Photo
                        </h3>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                width: '100%',
                                borderRadius: '0.5rem',
                                backgroundColor: '#000',
                                marginBottom: '1rem',
                            }}
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
            ) : null}
        </div>
    );
};

export default PlantPhotoSelector;
