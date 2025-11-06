// src/utils/axiosInstance.js
import axios from 'axios';
import { BASE_URL } from './apiPaths';

const axiosInstance = axios.create({
  baseURL: BASE_URL, // məsələn: https://quisor-dev.onrender.com
  timeout: 80000,
  withCredentials: true, // cookie varsa da getsin (opsional)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ⬇️ ƏSAS HİSSƏ: LocalStorage-dakı token-i Authorization başlığına qoy
axiosInstance.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosInstance;
