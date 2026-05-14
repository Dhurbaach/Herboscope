import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { UserContext } from '../components/context/userContext';
import Toast from '../components/Toast';

export default function Plant() {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Inquiry states
  const [inquiries, setInquiries] = useState([]);
  const [inquiryText, setInquiryText] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    let mounted = true;

    // Check if plant data is in sessionStorage (newly added plant)
    const cachedPlant = sessionStorage.getItem(`plant_${id}`);
    if (cachedPlant) {
      try {
        const plantData = JSON.parse(cachedPlant);
        if (mounted) {
          setPlant(plantData);
          setLoading(false);
        }
        return;
      } catch (e) {
        console.warn('Could not parse cached plant:', e);
      }
    }

    // Otherwise fetch from API
    api
      .get(`/home/${id}`)
      .then((res) => {
        if (!mounted) return;
        setPlant(res.data);
        setLoading(false);
        // Fetch inquiries for this plant
        fetchInquiries();
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Failed to fetch plant');
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  const fetchInquiries = async () => {
    try {
      const response = await api.get(`/inquiries/plant/${id}`);
      setInquiries(response.data || []);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    }
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryText.trim()) {
      setToastMessage('Please enter your inquiry');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (!user) {
      setToastMessage('Please log in to ask an inquiry');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setSubmittingInquiry(true);
    try {
      const resolvedUserName =
        user?.fullName?.trim() ||
        user?.username?.trim() ||
        user?.name?.trim() ||
        (user?.email ? user.email.split('@')[0] : 'User');

      const response = await api.post(`/inquiries/plant/${id}`, {
        message: inquiryText,
        userName: resolvedUserName,
        userEmail: user.email,
      });
      
      setToastMessage('Inquiry sent successfully! Expert will reply soon.');
      setToastType('success');
      setShowToast(true);
      setInquiryText('');
      
      // Refresh inquiries
      fetchInquiries();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to submit inquiry';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
      console.error('Error submitting inquiry:', err);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="glass-card px-6 py-4 text-cyan-100 text-lg">Loading...</div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><div className="glass-card px-6 py-4 text-rose-100 text-lg">Error: {error}</div></div>;
  if (!plant) return <div className="min-h-screen flex items-center justify-center"><div className="glass-card px-6 py-4 text-slate-100 text-lg">Plant not found</div></div>;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="glass-panel overflow-hidden mb-6 text-white">
          {/* Plant Image */}
          {plant.image ? (
            <div className="w-full bg-white/5 flex items-center justify-center" style={{ maxHeight: '400px' }}>
              <img 
                src={plant.image} 
                alt={plant.localName} 
                className="max-h-96 w-auto object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-white/5 flex items-center justify-center">
              <span className="text-slate-200/70 text-lg">No image available</span>
            </div>
          )}
          
          {/* Plant Names */}
          <div className="p-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {plant.localName}
            </h1>
            {plant.scientificName && (
              <p className="text-2xl italic text-cyan-100/75 mb-4">
                {plant.scientificName}
              </p>
            )}
            <p className="text-sm text-slate-200/60">
              Added: {new Date(plant.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Description Section */}
        {plant.description && (
          <div className="glass-panel p-8 mb-6 text-white">
            <h2 className="text-2xl font-bold text-cyan-100 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Description
            </h2>
            <p className="text-slate-200/80 leading-relaxed whitespace-pre-line">
              {plant.description}
            </p>
          </div>
        )}

        {/* Uses Section */}
        {plant.uses && (
          <div className="glass-panel p-8 text-white">
            <h2 className="text-2xl font-bold text-cyan-100 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Uses & Benefits
            </h2>
            <p className="text-slate-200/80 leading-relaxed whitespace-pre-line">
              {plant.uses}
            </p>
          </div>
        )}

        {/* Ask Expert Section */}
        <div className="glass-panel p-8 mb-6 mt-6 text-white">
          <h2 className="text-2xl font-bold text-cyan-100 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ask an Expert
          </h2>

          {/* Inquiry Form */}
          <form onSubmit={handleSubmitInquiry} className="mb-8">
            <div className="mb-4">
              <textarea
                value={inquiryText}
                onChange={(e) => setInquiryText(e.target.value)}
                placeholder="Ask your question about this plant..."
                className="w-full glass-input p-4 rounded-lg resize-none h-24 text-white placeholder-slate-400/50"
              />
            </div>
            <button
              type="submit"
              disabled={submittingInquiry || !user}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                !user
                  ? 'bg-white/10 text-slate-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-600 hover:via-teal-600 hover:to-green-600 text-white shadow-lg hover:shadow-emerald-500/50'
              }`}
            >
              {submittingInquiry ? 'Sending...' : user ? 'Send Inquiry' : 'Log in to Ask'}
            </button>
          </form>

          {/* Inquiries List */}
          {inquiries.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-100 mb-4">Recent Inquiries</h3>
              {inquiries.map((inquiry) => (
                <div key={inquiry._id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                  {/* User Question */}
                  <div className="mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-cyan-100">{inquiry.userName}</p>
                      <span className="text-xs text-slate-400">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-200/80">{inquiry.message}</p>
                  </div>

                  {/* Expert Replies */}
                  {inquiry.replies && inquiry.replies.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      <p className="text-xs text-emerald-100/75 font-semibold">Expert Replies:</p>
                      {inquiry.replies.map((r, idx) => (
                        <div key={idx} className="pl-4 border-l-2 border-emerald-500/50 bg-white/5 p-3 rounded">
                          <p className="text-xs text-emerald-100/75 font-semibold mb-1">{r.adminName}:</p>
                          <p className="text-slate-200/75">{r.replyText}</p>
                          <span className="text-xs text-slate-400 mt-2 block">
                            {new Date(r.replyDate).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : inquiry.reply ? (
                    <div className="mt-4 pl-4 border-l-2 border-emerald-500/50 bg-white/5 p-3 rounded">
                      <p className="text-xs text-emerald-100/75 font-semibold mb-1">Expert Reply:</p>
                      <p className="text-slate-200/75">{inquiry.reply}</p>
                      <span className="text-xs text-slate-400 mt-2 block">
                        Replied: {new Date(inquiry.replyDate).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-slate-400 italic">
                      Waiting for expert reply...
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-300/70 text-center py-6">
              No inquiries yet. Be the first to ask an expert!
            </p>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="glass-button"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          duration={9000}
        />
      )}
    </div>
  );
}
