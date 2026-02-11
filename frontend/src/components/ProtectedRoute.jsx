import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// ProtectedRoute: if unauthenticated, show a short message then navigate to /login
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  // You can change this check to whatever your auth uses (token, user in localStorage)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const cachedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const isAuthenticated = !!token || !!cachedUser;

  useEffect(() => {
    let timer;
    if (!isAuthenticated) {
      setRedirecting(true);
      // wait 1.6s then navigate to login, preserving attempted location
      timer = setTimeout(() => {
        navigate('/login', { state: { from: location }, replace: true });
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAuthenticated, navigate, location]);

  if (isAuthenticated) return children;

  // show a brief message before redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-green-50 p-6">
      <div className="max-w-lg w-full bg-white shadow-lg border rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Login required</h2>
        <p className="text-gray-600 mb-4">You must be logged in to access this page. Redirecting to the login page…</p>
        <div className="flex items-center justify-center gap-3">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={() => navigate('/login', { state: { from: location } })}
          >
            Go to Login Now
          </button>
          <span className="text-sm text-gray-500">(Will redirect automatically)</span>
        </div>
      </div>
    </div>
  );
}
