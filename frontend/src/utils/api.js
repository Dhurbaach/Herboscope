import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // or your backend URL
  timeout: 60000, // Set a timeout for requests (optional) - 60 seconds for image search
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 🔐 Attach token automatically to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

//Resposne Interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle specific error status codes

        if (error.response) {
          if (error.response.status === 401) {
            const requestUrl = error.config?.url || '';
            const isAuthRequest = requestUrl.includes('/login') || requestUrl.includes('/register');
            const isOnAuthPage = typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/register');

            // Avoid redirect loop on auth pages or auth requests
            if (!isAuthRequest && !isOnAuthPage) {
              window.location.href = '/login';
            }
          } else if (error.response.status === 500) {
                console.error('Server error:', error.response.data);
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timeout:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
