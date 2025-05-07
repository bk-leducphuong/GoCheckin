import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import { ApiError } from "@/lib/error";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    let errorMessage: string = "An error occurred";
    if (error.response) {
      errorMessage = (error.response.data as { message: string }).message;
    }

    throw new ApiError(errorMessage, error.response?.status || 500);
  }
);

export default api;
