import React from 'react';
import { SustainabilityIcon, EducationIcon, WellnessIcon } from '../components/Icons';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-4">About Herboscope</h1>
          <p className="text-lg text-gray-600">Discover the power of herbal plants and their benefits</p>
        </div>

        {/* Mission Section */}
        <div className="mb-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            Herboscope is dedicated to making herbal plant knowledge accessible to everyone. We believe in the power of nature and want to help people discover, learn about, and utilize the incredible benefits that medicinal and culinary herbs have to offer. Our platform brings together comprehensive plant information, identification tools, and health benefits in one easy-to-use application.
          </p>
        </div>

        {/* What We Do Section */}
        <div className="mb-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">What We Do</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-3">✓</span>
              <span><strong>Plant Identification:</strong> Use image recognition technology to identify plants from photos</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-3">✓</span>
              <span><strong>Detailed Information:</strong> Access comprehensive data about plant properties, uses, and benefits</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-3">✓</span>
              <span><strong>Health Benefits:</strong> Learn about the medicinal and nutritional properties of herbs</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-3">✓</span>
              <span><strong>Expert Resources:</strong> Get information from reliable and scientific sources</span>
            </li>
          </ul>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Why Choose Herboscope?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="font-semibold text-green-700 mb-2">Accurate Information</h3>
              <p className="text-gray-600">All information is carefully curated and verified from scientific sources.</p>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="font-semibold text-green-700 mb-2">User-Friendly</h3>
              <p className="text-gray-600">Simple interface designed for both beginners and herbal enthusiasts.</p>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="font-semibold text-green-700 mb-2">Advanced Technology</h3>
              <p className="text-gray-600">AI-powered image recognition for accurate plant identification.</p>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="font-semibold text-green-700 mb-2">Constantly Updated</h3>
              <p className="text-gray-600">New plants and information added regularly to our database.</p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-green-100 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-center mb-2">
                <SustainabilityIcon />
              </div>
              <h3 className="font-semibold text-green-800 mb-2">Sustainability</h3>
              <p className="text-green-700 text-sm">Promoting sustainable herbal practices and conservation</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <EducationIcon />
              </div>
              <h3 className="font-semibold text-green-800 mb-2">Education</h3>
              <p className="text-green-700 text-sm">Empowering people with knowledge about nature's remedies</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <WellnessIcon />
              </div>
              <h3 className="font-semibold text-green-800 mb-2">Wellness</h3>
              <p className="text-green-700 text-sm">Supporting holistic health and natural well-being</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Start Your Herbal Journey Today</h2>
          <p className="text-gray-600 mb-6">Explore thousands of herbs and discover their incredible benefits</p>
          <a href="/" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
            Explore Plants
          </a>
        </div>
      </div>
    </div>
  );
}
