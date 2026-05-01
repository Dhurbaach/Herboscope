import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import api from '../utils/api';
import { useUserAuth } from '../../hooks/UserAuth';

export default function AdminInquiries() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unanswered, answered
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const { authMessage } = useUserAuth();
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [authToastMessage, setAuthToastMessage] = useState('');

  // Capture auth message when it appears
  useEffect(() => {
    if (authMessage && !showAuthToast) {
      setAuthToastMessage(authMessage);
      setShowAuthToast(true);
    }
  }, [authMessage, showAuthToast]);

  // Fetch all inquiries
  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inquiries');
      setInquiries(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch inquiries');
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      setToastMessage('Please enter a reply');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setSubmittingReply(true);
    try {
      await api.put(`/inquiries/${replyingTo}`, { reply: replyText });
      setToastMessage('Reply sent successfully!');
      setToastType('success');
      setShowToast(true);
      setReplyText('');
      setReplyingTo(null);
      fetchInquiries(); // Refresh inquiries
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to submit reply';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
      console.error('Error submitting reply:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Delete this inquiry? This cannot be undone.')) return;

    try {
      await api.delete(`/inquiries/${id}`);
      setToastMessage('Inquiry deleted successfully!');
      setToastType('success');
      setShowToast(true);
      fetchInquiries(); // Refresh inquiries
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to delete inquiry';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
      console.error('Error deleting inquiry:', err);
    }
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter((inquiry) => {
    if (filter === 'unanswered') return !inquiry.reply;
    if (filter === 'answered') return inquiry.reply;
    return true;
  });

  const unansweredCount = inquiries.filter((i) => !i.reply).length;

  return (
    <>
      <Header />
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto text-white">
          {/* Header */}
          <div className="glass-panel p-6 mb-6">
            <h1 className="page-title text-3xl md:text-4xl">Manage Inquiries</h1>
            <p className="text-slate-200/75 mt-2">
              Respond to user inquiries and build expert credibility
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="glass-panel p-4 mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white'
                  : 'glass-button-secondary'
              }`}
            >
              All ({inquiries.length})
            </button>
            <button
              onClick={() => setFilter('unanswered')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'unanswered'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white'
                  : 'glass-button-secondary'
              }`}
            >
              Unanswered ({unansweredCount})
            </button>
            <button
              onClick={() => setFilter('answered')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'answered'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white'
                  : 'glass-button-secondary'
              }`}
            >
              Answered ({inquiries.filter((i) => i.reply).length})
            </button>
          </div>

          {/* Status Messages */}
          {loading && (
            <div className="glass-card px-4 py-3 inline-block text-cyan-100 mb-6">
              Loading inquiries...
            </div>
          )}
          {error && (
            <div className="glass-card px-4 py-3 inline-block text-rose-100 mb-6">
              Error: {error}
            </div>
          )}

          {/* Inquiries List */}
          <div className="space-y-4">
            {filteredInquiries.length > 0 ? (
              filteredInquiries.map((inquiry) => (
                <div
                  key={inquiry._id}
                  className="glass-panel p-6 border border-white/10"
                >
                  {/* Inquiry Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <p className="font-semibold text-cyan-100">
                        {inquiry.userName}
                        {inquiry.userEmail && (
                          <span className="text-slate-400 text-sm ml-2">
                            ({inquiry.userEmail})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(inquiry.createdAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-300/80 mt-1">
                        Plant: {inquiry?.plantId?.plantName || 'Unknown plant'}
                        {inquiry?.plantId?.scientificName ? ` (${inquiry.plantId.scientificName})` : ''}
                      </p>
                    </div>
                    {!inquiry.reply && (
                      <span className="bg-rose-500/30 text-rose-100 px-3 py-1 rounded-full text-xs font-semibold">
                        Pending
                      </span>
                    )}
                    {inquiry.reply && (
                      <span className="bg-emerald-500/30 text-emerald-100 px-3 py-1 rounded-full text-xs font-semibold">
                        Answered
                      </span>
                    )}
                  </div>

                  {/* Inquiry Message */}
                  <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-slate-200/90">{inquiry.message}</p>
                  </div>

                  {/* All Replies */}
                  {inquiry.replies && inquiry.replies.length > 0 && (
                    <div className="mb-4 space-y-3">
                      <p className="text-xs text-emerald-100/75 font-semibold">All Replies:</p>
                      {inquiry.replies.map((r, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <p className="text-xs text-emerald-100/75 font-semibold mb-1">
                            {r.adminName} ({new Date(r.replyDate).toLocaleString()})
                          </p>
                          <p className="text-slate-100">{r.replyText}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Reply Form */}
                  {replyingTo === inquiry._id ? (
                    <div className="mb-4">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your expert reply..."
                        className="w-full glass-input p-3 rounded-lg resize-none h-24 text-white placeholder-slate-400/50 mb-3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleReplySubmit}
                          disabled={submittingReply}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingReply ? 'Sending...' : 'Send Reply'}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          className="px-4 py-2 glass-button-secondary rounded-lg font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReplyingTo(inquiry._id)}
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white py-2 rounded-lg font-semibold transition"
                      >
                        {inquiry.replies && inquiry.replies.length > 0 ? 'Add Another Reply' : 'Reply'}
                      </button>
                      <button
                        onClick={() => handleDeleteInquiry(inquiry._id)}
                        className="px-4 py-2 glass-button-secondary rounded-lg font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="glass-panel p-8 text-center text-slate-300/70">
                <p className="text-lg">
                  {loading
                    ? 'Loading inquiries...'
                    : filter === 'unanswered'
                    ? 'No pending inquiries!'
                    : 'No inquiries found.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          duration={4000}
        />
      )}
      {showAuthToast && (
        <Toast
          message={authToastMessage}
          type="error"
          onClose={() => setShowAuthToast(false)}
          duration={10000}
        />
      )}

      <Footer />
    </>
  );
}
