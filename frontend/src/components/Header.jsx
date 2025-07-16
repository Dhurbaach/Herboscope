// components/Header.jsx
import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-green-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 text-2xl font-bold">
            🌿 PlantCare
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6 items-center">
            <a href="/" className="hover:text-yellow-300">Home</a>
            <a href="/about" className="hover:text-yellow-300">About</a>
            <a href="/contact" className="hover:text-yellow-300">Contact</a>
            <a href="/login" className="hover:text-yellow-300">Login / Signup</a>
            <UserCircleIcon className="w-7 h-7 text-white" />
          </nav>

          {/* Search bar (desktop only) */}
          <div className="hidden md:block ml-4">
            <input
              type="text"
              placeholder="Search plants..."
              className="px-3 py-1 rounded-md text-black focus:outline-none"
            />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-green-700 px-4 pb-4">
          <div className="flex flex-col space-y-3">
            <a href="/" className="hover:text-yellow-300">Home</a>
            <a href="/about" className="hover:text-yellow-300">About</a>
            <a href="/contact" className="hover:text-yellow-300">Contact</a>
            <a href="/login" className="hover:text-yellow-300">Login / Signup</a>
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="w-6 h-6" />
              <span>User</span>
            </div>
            <input
              type="text"
              placeholder="Search plants..."
              className="px-3 py-1 rounded-md text-black focus:outline-none mt-2"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
