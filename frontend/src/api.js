import axios from 'axios';

// Автоматически определяем, где открыт фронтенд в браузере
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Если запустили локально — запросы идут на локальный бэкенд (порт 5000)
// Если открыли развернутый сайт — запросы идут на ваш сервер в Render
const baseURL = isLocalhost 
    ? 'http://localhost:5000/api' 
    : 'https://pulsecore-api.onrender.com/api';

const api = axios.create({
    baseURL: baseURL
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