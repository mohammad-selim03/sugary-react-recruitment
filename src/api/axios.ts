import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://sugarytestapi.azurewebsites.net',
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('token');

      try {
        const res = await instance.post('/Account/RefreshToken', {
          AccessToken: accessToken,
          RefreshToken: refreshToken,
        });

        if (res.data.Success) {
          localStorage.setItem('token', res.data.Token);
          localStorage.setItem('refreshToken', res.data.RefreshToken);
          instance.defaults.headers.common['Authorization'] = `Bearer ${res.data.Token}`;
          originalRequest.headers['Authorization'] = `Bearer ${res.data.Token}`;
          return instance(originalRequest);
        }
      } catch (err) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
