import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://sugarytestapi.azurewebsites.net',
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    if (err.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const res = await instance.post('/Account/RefreshToken', {
        AccessToken: localStorage.getItem('token'),
        RefreshToken: localStorage.getItem('refreshToken'),
      });
      if (res.data.Success) {
        localStorage.setItem('token', res.data.Token);
        localStorage.setItem('refreshToken', res.data.RefreshToken);
        instance.defaults.headers.common['Authorization'] = `Bearer ${res.data.Token}`;
        originalRequest.headers['Authorization'] = `Bearer ${res.data.Token}`;
        return instance(originalRequest);
      }
    }
    return Promise.reject(err);
  }
);

export default instance;
