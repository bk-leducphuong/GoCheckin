import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
interface QueueItem {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
}
let refreshQueue: QueueItem[] = [];

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

// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error: AxiosError) => {
//     const originalRequest = error.config as AxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     if (!originalRequest) {
//       return Promise.reject(error);
//     }

//     // If error is 401 and we haven't tried to refresh yet
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       // If already refreshing, add this request to the queue
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           refreshQueue.push({
//             onSuccess: (token) => {
//               if (originalRequest.headers) {
//                 originalRequest.headers.Authorization = `Bearer ${token}`;
//               }
//               resolve(axios(originalRequest));
//             },
//             onFailure: (err) => {
//               reject(err);
//             },
//           });
//         });
//       }

//       isRefreshing = true;

//       try {
//         const authStore = useAuthStore.getState();
//         authStore.refreshAccessToken();

//         const accessToken = authStore.accessToken; // Get the new access token
//         // Update authorization header for the original request
//         if (originalRequest.headers) {
//           originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//         }

//         // Process any requests that came in while refreshing
//         processQueue(null, accessToken);
//         isRefreshing = false;

//         // Retry the original request
//         return axios(originalRequest);
//       } catch (refreshError) {
//         // Process queue with error
//         processQueue(refreshError as AxiosError, null);
//         isRefreshing = false;

//         // Logout user as refresh token is invalid
//         const authStore = useAuthStore.getState();
//         authStore.logout();

//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default api;
