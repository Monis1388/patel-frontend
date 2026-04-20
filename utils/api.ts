import axios from 'axios';

const getBaseURL = () => {
    const rawURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    return rawURL.endsWith('/') ? rawURL.slice(0, -1) : rawURL;
};

export const BACKEND_URL = getBaseURL();

/**
 * Clean image URLs by replacing localhost with the actual backend URL
 */
export const cleanImageUrl = (url: string | null | undefined) => {
    if (!url) return '';
    // Replace localhost references with the actual backend URL in production
    if (url.includes('localhost:5001') || url.includes('127.0.0.1:5001')) {
        return url.replace(/http:\/\/(localhost|127\.0\.0\.1):5001/, BACKEND_URL);
    }
    // If the URL is a relative path (starts with /), prepend the backend URL
    if (url.startsWith('/') && !url.startsWith('/uploads/')) {
        return `${BACKEND_URL}${url}`;
    }
    // For Cloudinary or absolute URLs, return with timestamp
    const timestamp = Date.now();
    const finalUrl = url.startsWith('http') ? url : (url.startsWith('/') && !url.startsWith('/uploads/') ? `${BACKEND_URL}${url}` : `${BACKEND_URL}/${url.replace(/^\//, '')}`);
    
    // Append timestamp to prevent browser caching
    return finalUrl.includes('?') ? `${finalUrl}&v=${timestamp}` : `${finalUrl}?v=${timestamp}`;
};

const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
});

api.interceptors.request.use(
    (config) => {
        const userInfo = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
        if (userInfo) {
            try {
                const { token } = JSON.parse(userInfo);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Error parsing userInfo from localStorage', error);
            }
        }
        
        // Cache busting: Append timestamp to all GET requests
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now()
            };
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('userInfo');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
