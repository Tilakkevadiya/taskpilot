import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error("No refresh token available");

                const res = await axios.post('http://localhost:8080/api/auth/refresh', {
                    refreshToken: refreshToken
                });

                // Store new tokens
                localStorage.setItem('token', res.data.accessToken);

                // Update default header
                api.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, clear storage and trigger logout
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Pass through all other errors (including 403) to the calling component
        return Promise.reject(error);
    }
);

export default api;
