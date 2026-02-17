import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // or your backend URL
  timeout: 20000, // Set a timeout for requests (optional)
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
                //Redirect to login page
                window.location.href = '/login';
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
