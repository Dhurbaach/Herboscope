import React, { useState, useEffect } from 'react';
import { EmailIcon, PhoneIcon, LocationIcon } from '../components/Icons';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    review: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-fill name and email from logged-in user
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setFormData(prev => ({
          ...prev,
          name: user.username[0].toUpperCase() + user.username.slice(1).toLowerCase() || user.name[0].toUpperCase() + user.name.slice(1).toLowerCase() || '',
          email: user.email || ''
        }));
      }
    } catch (err) {
      console.warn('Could not parse user from localStorage:', err);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.subject || !formData.review) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate sending the review (you can connect this to your backend)
      console.log('Review submitted:', formData);
      
      // Here you would typically send the data to your backend
      // await api.post('/contact', formData);
      
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        review: ''
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting your review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600">We'd love to hear your feedback and reviews about Herboscope</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <a href="mailto:support@herboscope.com" className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg hover:scale-105 transition transform cursor-pointer">
            <div className="flex justify-center mb-3">
              <EmailIcon />
            </div>
            <h3 className="font-semibold text-green-700 mb-2">Email</h3>
            <p className="text-gray-600">support@herboscope.com</p>
          </a>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-3">
              <PhoneIcon />
            </div>
            <h3 className="font-semibold text-green-700 mb-2">Phone</h3>
            <p className="text-gray-600">+1 (555) 123-4567</p>
          </div>

          <a href="https://www.google.com/maps/search/Pokhara" target="_blank" rel="noopener noreferrer" className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg hover:scale-105 transition transform cursor-pointer">
            <div className="flex justify-center mb-3">
              <LocationIcon />
            </div>
            <h3 className="font-semibold text-green-700 mb-2">Location</h3>
            <p className="text-gray-600">Herboscope HQ, Green City</p>
          </a>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h2 className="text-2xl font-bold text-green-800 mb-8">Send Us Your Review</h2>

          {submitted && (
            <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-600 text-green-700">
              <p className="font-semibold">Thank you for your review!</p>
              <p>We appreciate your feedback and will get back to you soon.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                required
              />
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., Great app, Feature request, Bug report"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                required
              />
            </div>

            {/* Review/Message Field */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Your Review/Message</label>
              <textarea
                name="review"
                value={formData.review}
                onChange={handleChange}
                placeholder="Share your thoughts, experience, or suggestions about Herboscope..."
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 resize-none"
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white font-semibold px-8 py-3 rounded-lg transition`}
              >
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-green-800 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-green-700 mb-2">How long does it take to receive a response?</h3>
              <p className="text-gray-600">We typically respond to all inquiries within 24-48 hours during business days.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-green-700 mb-2">Can I provide feedback anonymously?</h3>
              <p className="text-gray-600">While we prefer to have your contact information to follow up, you can provide your feedback through this form and we'll handle it professionally.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-green-700 mb-2">What types of feedback do you accept?</h3>
              <p className="text-gray-600">We welcome all feedback including compliments, suggestions for improvements, bug reports, and feature requests.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
