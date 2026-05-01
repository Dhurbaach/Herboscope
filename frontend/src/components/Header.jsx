// components/Header.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Bars3Icon, XMarkIcon, UserCircleIcon, BellIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import Toast from './Toast';
import NotificationCenter from './NotificationCenter';
import { UserContext } from './context/userContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { user, clearUser } = useContext(UserContext);
  const timerRef = useRef(null);
  const notificationRef = useRef(null);

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

  // Fetch notification count when user changes
  useEffect(() => {
    if (user && user.email) {
      fetchNotificationCount();
      // Refresh notification count every 30 seconds
      const interval = setInterval(fetchNotificationCount, 30000);
      return () => clearInterval(interval);
    } else {
      setNotificationCount(0);
    }
  }, [user]);

  const fetchNotificationCount = async () => {
    try {
      if (!user?.email) return;
      const response = await api.get(`/inquiries/user/notifications/${user.email}`);
      setNotificationCount(response.data?.length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Close notification menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearUser();
    window.location.href = '/';
  };

  const openPlant = (id) => {
    window.location.href = `/plant/${id}`;
    setQuery('');
    setShowSuggestions(false);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="sticky top-0 z-40 text-white">
      <div className="mx-auto max-w-9xl px-4 sm:px-6 lg:px-8 pt-3">
        <div className="glass-shell rounded-2xl px-4 sm:px-6 py-7 flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0 text-3xl font-bold tracking-wide">
            <a href="/" className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">Herboscope</a>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-5 items-center text-lg font-medium text-slate-100/90">
            {user?.role === 'admin' && (
              <a href="/admin" className="hover:text-cyan-200 transition">Admin</a>
            )}
            <a href="/" className="hover:text-cyan-200 transition">Home</a>
            {
              user?.role !== 'admin' && (
                <>
                  <a href="/about" className="hover:text-cyan-200 transition">About</a>
                  <a href="/contact" className="hover:text-cyan-200 transition">Contact</a>
                </>
              )}
            {user ? (
              <>
                <button onClick={handleLogout} className="hover:text-cyan-200 transition">Logout</button>
                <UserCircleIcon className="w-7 h-7 text-cyan-100" />
                <span className="font-medium text-slate-50">Hi,{(user?.fullName || user?.username || 'User').split(' ')[0]}</span>

                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={handleNotificationClick}
                    className="relative orange p-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <BellIcon className="w-6 h-6 text-cyan-100" />
                    {notificationCount > 0 && (
                      <span className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute left-0 mt-2 z-50" style={{ minWidth: 320 }}>
                      <NotificationCenter inline={true} includeRead={true} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <a href="/login" className="hover:text-cyan-200 transition">Sign In</a>
              </>
            )}
          </nav>

          {/* Search bar (desktop only) */}
          <div className="hidden md:block ml-4 relative w-72">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plants..."
              className="glass-input py-2 w-full text-sm"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-2 glass-card text-slate-100 z-50 max-h-60 overflow-auto py-2">
                {suggestions.map((s) => (
                  <li
                    key={s.id}
                    className="px-3 py-2 hover:bg-white/10 cursor-pointer transition"
                    onClick={() => openPlant(s.id)}
                  >
                    {s.localName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user && notificationCount > 0 && (
              <div className="relative">
                <BellIcon className="w-6 h-6 text-cyan-200" />
                <span className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="rounded-xl p-2 bg-white/10 border border-white/15">
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
        <div className="md:hidden mx-4 mt-3 glass-shell rounded-2xl px-4 pb-4">
          <div className="flex flex-col space-y-3">
            {/* Notification Alert for Mobile */}
            {user && notificationCount > 0 && (
              <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-lg p-3 mb-2">
                <p className="text-sm font-semibold text-cyan-100">
                  🔔 You have {notificationCount} new expert repl{notificationCount === 1 ? 'y' : 'ies'}
                </p>
              </div>
            )}
            
            <a href="/" className="hover:text-cyan-200">Home</a>
            {user?.role === 'admin' && (
              <a href="/admin" className="hover:text-cyan-200">Admin</a>
            )}
            <a href="/about" className="hover:text-cyan-200">About</a>
            <a href="/contact" className="hover:text-cyan-200">Contact</a>
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <span>{(user?.fullName || user?.username || 'User').split(' ')[0]}</span>
                </div>
                <button onClick={handleLogout} className="text-left hover:text-cyan-200">Logout</button>
              </>
            ) : (
              <>
                <a href="/login" className="hover:text-cyan-200">Login / Signup</a>
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
              className="glass-input mt-2 py-2"
            />
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="info"
          onClose={() => setShowToast(false)}
          duration={3000}
        />
      )}
    </header>
  );
};

export default Header;
