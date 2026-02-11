import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Signin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

   const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const res = await api.post('/login', {
      username: formData.username,
      password: formData.password,
    });

    const token = res?.data?.token;

    if (token) {
      localStorage.setItem('token', token);

      // Fetch profile (Authorization header now auto-attached)
      try {
        const profileRes = await api.get('/profile');
        const user = profileRes?.data?.user || null;
        if (user) localStorage.setItem('user', JSON.stringify(user));
        else localStorage.removeItem('user');
      } catch {
        localStorage.removeItem('user');
      }

      window.dispatchEvent(new Event('authChanged'));
      navigate('/');
    } else {
      setError('Login failed: no token returned');
    }
  } catch (err) {
    const message =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err.message ||
      'Login failed';
    setError(message);
  } finally {
    setLoading(false);
  }
};
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 via-green-300 to-teal-500 px-4">
            <div className="bg-white/10 backdrop-blur-lg border border-white/30 p-8 rounded-2xl w-full max-w-md shadow-xl">
                <h2 className="text-3xl font-bold text-center text-white mb-6">Sign In</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-white mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white/40"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-white mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white/40"
                            placeholder="Enter your password"
                        />
                        <div className="text-right mt-1">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-green-200 hover:underline"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full ${loading ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'} transition-all duration-300 py-2 px-4 rounded-lg font-semibold text-white`}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {error && <p className="mt-4 text-sm text-red-300 text-center">{error}</p>}

                <p className="mt-4 text-sm text-white text-center">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-green-200 hover:underline font-medium">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
