import axios from 'axios';
import { getToken, saveToken, deleteToken } from '../utils/secureStore';
import { useAppStore } from '../store/useAppStore';
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getToken('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });

        await saveToken('access_token', data.access_token);
        await saveToken('refresh_token', data.refresh_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {

        await deleteToken('access_token');
        await deleteToken('refresh_token');
        useAppStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
