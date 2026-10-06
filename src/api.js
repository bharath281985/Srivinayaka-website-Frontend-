import axios from 'axios';
import { API_BASE_URL } from './config/urls';

const API = axios.create({
    baseURL: API_BASE_URL,
});

// For website, we might not always have a user token yet, 
// so we'll check and attach if present (e.g. from local storage)
API.interceptors.request.use((config) => {
    const storedUser = localStorage.getItem('saree_user');
    if (storedUser) {
        const { token } = JSON.parse(storedUser);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
