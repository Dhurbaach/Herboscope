import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import api from './utils/api';

// Importing pages
import Home from './pages/Home';
import Plant from './pages/Plant';
import About from './pages/About';
import Contact from './pages/Contact';
import AddPlant from './pages/AddPlant';
import EditPlant from './pages/EditPlant';
import PlantRecognize from './pages/PlantRecognize';
import Login from './pages/Signin';
import Register from './pages/Register';
import AdminHome from './pages/AdminHome';
import ApiResponse from './pages/ApiResponse';
// import EditPlant from './pages/EditPlant';

function AppContent() {
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    let mounted = true;
    api
      .get('/')
      .then((res) => {
        if (mounted) setBackendStatus('online');
        console.log('Backend response:', res.data);
      })
      .catch((err) => {
        if (mounted) setBackendStatus('offline');
        console.warn('Backend unreachable:', err.message);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div className="p-2 text-sm text-right">
        Backend: <span className={backendStatus === 'online' ? 'text-green-600' : backendStatus === 'checking' ? 'text-yellow-600' : 'text-red-600'}>{backendStatus}</span>
      </div>

      <Routes>
        <Route path="/" element={<Home api={api} />} />
        <Route path='/admin' element={<AdminHome api={api} />} />
        <Route path='/edit-plant/:id' element={<EditPlant api={api} />} />
        <Route path="/plant/:id" element={<Plant api={api} />} />
        <Route path="/about" element={<About />} />
          <Route path='/recognize' element={<PlantRecognize />} />
          <Route path='/api-response' element={<ApiResponse />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/add-plant" element={<AddPlant />} />
        <Route path="/login" element={<Login api={api} />} />
        <Route path="/register" element={<Register api={api} />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
