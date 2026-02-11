// src/components/Footer.jsx
import React from 'react';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './Icons'; // optional: create your own SVGs or use placeholder icons

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold">Herboscope</h2>
          <p className="mt-2 text-sm text-gray-300">
            Discover, learn, and cherish the power of plants.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1 text-gray-300">
            <li><a href="/" className="hover:text-yellow-300">Home</a></li>
            <li><a href="/about" className="hover:text-yellow-300">About</a></li>
            <li><a href="/contact" className="hover:text-yellow-300">Contact</a></li>
            <li><a href="/login" className="hover:text-yellow-300">Login/Signup</a></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#"><FacebookIcon /></a>
            <a href="#"><InstagramIcon /></a>
            <a href="#"><TwitterIcon /></a>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-400 py-4 border-t border-green-700">
        © {new Date().getFullYear()} Herboscope. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
