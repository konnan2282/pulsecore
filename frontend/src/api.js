import axios from 'axios';

const api = axios.create({
    // ВАША НОВАЯ ОБЛАЧНАЯ ССЫЛКА ИЗ RENDER:
    baseURL: 'https://pulsecore-api.onrender.com/api'
});

// Перехватчик: автоматически вставляет токен авторизации из localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;