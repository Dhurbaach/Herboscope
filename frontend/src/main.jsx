import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import UserProvider from './components/context/userContext.jsx';
import './index.css'; // ✅ Import your styles here

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);
