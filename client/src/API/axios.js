import axios from 'axios';

const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000/'}api`,
    withCredentials: true, // Enable sending cookies with requests
});

// Flag to prevent refresh token loop
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

// Request interceptor
API.interceptors.request.use((config) => {
    // Don't set Content-Type for FormData — browser sets it with boundary
    if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    }
    return config;
});

// Response interceptor with auto-refresh
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        // If access token expired or missing (401) — attempt refresh
        if (
            error.response?.status === 401 && 
            !originalRequest._retry &&
            originalRequest.url !== '/auth/refresh'
        ) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => API(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            // Call refresh endpoint
            return API.post('/auth/refresh')
                .then(() => {
                    // Refresh successful - retry original request
                    processQueue(null);
                    return API(originalRequest);
                })
                .catch((err) => {
                    // Refresh failed - session expired
                    processQueue(err);
                    sessionStorage.removeItem('user');
                    window.location.replace('/login');
                    window.dispatchEvent(new CustomEvent('session-expired'));
                    return Promise.reject(err);
                });
        }

        // 403 on /auth/refresh means refresh token is invalid/expired — must re-login
        if (error.response?.status === 403 && originalRequest.url === '/auth/refresh') {
            sessionStorage.removeItem('user');
            window.location.replace('/login');
            window.dispatchEvent(new CustomEvent('session-expired'));
        }

        return Promise.reject(error);
    }
);

export default API;