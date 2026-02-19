import React, { createContext, useState, useEffect } from 'react';
import api from '../../utils/api';

export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Initialize from localStorage
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });

    // Listen to authChanged events and storage changes
    useEffect(() => {
        const handleAuthChange = () => {
            try {
                const storedUser = localStorage.getItem('user');
                setUser(storedUser ? JSON.parse(storedUser) : null);
            } catch {
                setUser(null);
            }
        };

        window.addEventListener('authChanged', handleAuthChange);
        window.addEventListener('storage', handleAuthChange);

        return () => {
            window.removeEventListener('authChanged', handleAuthChange);
            window.removeEventListener('storage', handleAuthChange);
        };
    }, []);

    //Function to update user data
    const updateUser = (userData) => {
        setUser(userData);
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        }
    };

    //Function to clear user data on logout - handles full logout process
    const clearUser = () => {
        // Clear user state
        setUser(null);
        // Remove token and user from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Clear Authorization header from API instance
        delete api.defaults.headers.common['Authorization'];
        // Notify other parts of the app
        window.dispatchEvent(new Event('authChanged'));
    };

    return (
        <UserContext.Provider value={{ user, updateUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserProvider;