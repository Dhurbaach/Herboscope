import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = e => {
        e.preventDefault();
        console.log('Login submitted:', formData);
        // TODO: Add login logic here
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 via-green-300 to-teal-500 px-4">
            <div className="bg-white/10 backdrop-blur-lg border border-white/30 p-8 rounded-2xl w-full max-w-md shadow-xl">
                <h2 className="text-3xl font-bold text-center text-white mb-6">Sign In</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-white mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white/40"
                            placeholder="you@example.com"
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
                        className="w-full bg-green-500 hover:bg-green-600 transition-all duration-300 py-2 px-4 rounded-lg font-semibold text-white"
                    >
                        Sign In
                    </button>
                </form>

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
