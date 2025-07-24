import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic client-side validation can go here
    if (!formData.email.includes('@gmail.com')) {
      alert('Please enter a valid Gmail address');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Registering user:', formData);
    // Call API to register user here
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-green-300 to-teal-500 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-lg border border-white/30 shadow-xl rounded-2xl p-8 w-full max-w-md text-white"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>

        <label className="block mb-3">
          <span className="text-sm">Username</span>
          <input
            type="text"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 bg-white/20 border border-white/30 rounded-md backdrop-blur text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200"
            placeholder="Enter your username"
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm">Gmail</span>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 bg-white/20 border border-white/30 rounded-md backdrop-blur text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200"
            placeholder="Enter your Gmail"
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm">Password</span>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 bg-white/20 border border-white/30 rounded-md backdrop-blur text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200"
            placeholder="Enter password"
          />
        </label>

        <label className="block mb-5">
          <span className="text-sm">Confirm Password</span>
          <input
            type="password"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 bg-white/20 border border-white/30 rounded-md backdrop-blur text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200"
            placeholder="Confirm password"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 transition-all duration-300 py-2 px-4 rounded-lg font-semibold text-white"
        >
          Register
        </button>
        <p className="mt-4 text-sm text-white text-center">
  Already have an account?{' '}
  <Link
    to="/login"
    className="text-green-200 hover:underline font-medium"
  >
    Sign in here
  </Link>
</p>

      </form>
    </div>
  );
};

export default Register;
