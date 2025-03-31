import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

// Define the base URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Used to prevent multiple refresh token calls
let isRefreshing = false;
// TypeScript interface for the queue item
interface QueueItem {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
}
// Queue for requests that come in while refreshing token
let refreshQueue: QueueItem[] = [];

// Process the queue of requests
const processQueue = (error: AxiosError | null, token: string | null) => {
  refreshQueue.forEach((request) => {
    if (error) {
      request.onFailure(error);
    } else if (token) {
      request.onSuccess(token);
    }
  });
  refreshQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore.getState();
    const token = authStore.accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (!originalRequest) {
      return Promise.reject(error);
    }
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // If already refreshing, add this request to the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            onSuccess: (token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(axios(originalRequest));
            },
            onFailure: (err) => {
              reject(err);
            },
          });
        });
      }
      
      isRefreshing = true;
      
      try {
        const authStore = useAuthStore.getState();
        const refreshToken = authStore.refreshToken;
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Need to use direct axios to avoid circular dependency
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Update tokens in the store
        authStore.setTokens(accessToken, newRefreshToken);
        
        // Update authorization header for the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        // Process any requests that came in while refreshing
        processQueue(null, accessToken);
        isRefreshing = false;
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // Process queue with error
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        
        // Logout user as refresh token is invalid
        const authStore = useAuthStore.getState();
        authStore.logout();
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 