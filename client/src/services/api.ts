import axios from 'axios';

// Create a base axios instance with default configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(
        process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'token'
      );
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Handle authentication errors or token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Implement refresh token logic here if needed
      
      // Redirect to login if authentication fails
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 