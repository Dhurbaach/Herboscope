// src/components/Footer.jsx
import React from 'react';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './Icons'; // optional: create your own SVGs or use placeholder icons

const Footer = () => {
  return (
    <footer className="mt-10 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 glass-shell rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">Herboscope</h2>
          <p className="mt-2 text-sm text-slate-200/75">
            Discover, learn, and cherish the power of plants.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1 text-slate-200/75">
            <li><a href="/" className="hover:text-cyan-200">Home</a></li>
            <li><a href="/about" className="hover:text-cyan-200">About</a></li>
            <li><a href="/contact" className="hover:text-cyan-200">Contact</a></li>
            <li><a href="/login" className="hover:text-cyan-200">Login/Signup</a></li>
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

      <div className="text-center text-sm text-slate-200/60 py-4 border-t border-white/10 mt-4">
        © {new Date().getFullYear()} Herboscope. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
