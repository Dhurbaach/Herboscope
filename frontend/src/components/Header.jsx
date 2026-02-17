// components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timerRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      api
        .get('/home', { params: { q: query } })
        .then((res) => {
          setSuggestions(res.data || []);
          setShowSuggestions(true);
        })
        .catch(() => {
          setSuggestions([]);
          setShowSuggestions(false);
        });
    }, 250);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  // Load current user profile and listen for auth changes
  useEffect(() => {
    const fetchProfile = () => {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        api.get('/profile')
          .then((res) => {
            const u = res.data?.user || null;
            setUser(u);
            if (u) localStorage.setItem('user', JSON.stringify(u));
          })
          .catch(() => {
            delete api.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          });
      } else {
        // try to read a cached user for immediate update
        const cached = localStorage.getItem('user');
        if (cached) setUser(JSON.parse(cached));
        else setUser(null);
      }
    };

    fetchProfile();

    const onAuthChanged = () => fetchProfile();
    const onStorage = (e) => {
      if (e.key === 'token' || e.key === 'user') fetchProfile();
    };

    window.addEventListener('authChanged', onAuthChanged);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('authChanged', onAuthChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    // Notify other parts of the app
    window.dispatchEvent(new Event('authChanged'));
    window.location.href = '/';
  };

  const openPlantNewTab = (id) => {
    window.open(`/plant/${id}`, '_blank', 'noopener');
    setQuery('');
    setShowSuggestions(false);
  };

  return (
    <header className="bg-green-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 text-2xl font-bold">
            <a href="/" className="hover:text-yellow-300">Herboscope</a>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-5 items-center">
            <a href="/" className="hover:text-yellow-300">Home</a>
            <a href="/about" className="hover:text-yellow-300">About</a>
            <a href="/contact" className="hover:text-yellow-300">Contact</a>
            <a href="/add-plant" className="hover:text-yellow-300">Add Plant</a>
            {user ? (
              <>
                <button onClick={handleLogout} className="hover:text-yellow-300">Logout</button>
                <UserCircleIcon className="w-7 h-7 text-white" />
                <span className="font-medium ">Hi,{user.username[0].toUpperCase() + user.username.slice(1).toLowerCase()}</span>
              </>
            ) : (
              <>
                <a href="/register" className="hover:text-yellow-300">Signup</a>
              </>
            )}
          </nav>

          {/* Search bar (desktop only) */}
          <div className="hidden md:block ml-4 relative w-64">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plants..."
              className="px-3 py-1 rounded-md text-black focus:outline-none w-full"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 bg-white text-black rounded shadow-md z-50 max-h-60 overflow-auto">
                {suggestions.map((s) => (
                  <li
                    key={s.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => openPlantNewTab(s.id)}
                  >
                    {s.localName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
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
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <span>{user.username}</span>
                </div>
                <button onClick={handleLogout} className="text-left hover:text-yellow-300">Logout</button>
              </>
            ) : (
              <>
                <a href="/login" className="hover:text-yellow-300">Login / Signup</a>
                <div className="flex items-center space-x-2">
                  <span>User</span>
                </div>
              </>
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
