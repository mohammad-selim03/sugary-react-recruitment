import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const queueRequest = (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
  return new Promise((resolve) => {
    refreshSubscribers.push((newToken: string) => {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${newToken}`;
      }
      resolve(config);
    });
  });
};

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiresAt');

    if (token && tokenExpiry && new Date(tokenExpiry) < new Date()) {
      localStorage.removeItem('token');
      window.location.href = '/login?session=expired';
      return Promise.reject(new Error('Token expired'));
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        try {
          const newConfig = await queueRequest(originalRequest);
          return instance(newConfig);
        } catch (queueError) {
          return Promise.reject(queueError);
        }
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(new Error('No refresh token available'));
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/Account/RefreshToken`,
          {
            AccessToken: localStorage.getItem('token'),
            RefreshToken: refreshToken,
          }
        );

        if (!response.data.Success) {
          throw new Error('Token refresh failed');
        }

        localStorage.setItem('token', response.data.Token);
        localStorage.setItem('refreshToken', response.data.RefreshToken);
        localStorage.setItem('tokenExpiresAt', response.data.AccessTokenExpiresAt);

        if (instance.defaults.headers.common) {
          instance.defaults.headers.common.Authorization = `Bearer ${response.data.Token}`;
        }

        refreshSubscribers.forEach((cb) => cb(response.data.Token));
        refreshSubscribers = [];

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${response.data.Token}`;
        }
        return instance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiresAt');

        window.location.href = '/login?session=expired';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
