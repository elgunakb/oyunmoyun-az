// client/src/utils/axiosInstance.js
import axios from 'axios';

// ENV > BASE_URL > fallback
const ENV_BASE = import.meta.env.VITE_API_URL; // məsələn: https://quisor-dev.onrender.com
// Əgər ayrıca BASE_URL konstantın varsa, onu da ehtiyat kimi istifadə edə bilərsən:
import { BASE_URL as BASE_FROM_CONST } from './apiPaths';

const axiosInstance = axios.create({
  baseURL: ENV_BASE ?? BASE_FROM_CONST ?? 'https://quisor-dev.onrender.com',
  timeout: 80000,
  withCredentials: false, // cookie istifadə etmirsənsə OFF saxla
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// --- Authorization header (Bearer token) avtomatik əlavə et ---
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Mövcud başlıqların üzərinə yazmamaq üçün merge et
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  } else {
    // Token yoxdursa, ehtiyat üçün bu başlığı sil
    if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
  }
  return config;
});

// Cavab interceptoru (istəsən 401-də auto-logout edə bilərsən)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // məsələn:
    // if (error?.response?.status === 401) { localStorage.clear(); window.location.href = '/'; }
    return Promise.reject(error);
  }
);

export default axiosInstance;
