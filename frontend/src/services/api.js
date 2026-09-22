import axios from "axios";

// Base URL for Spring Boot Backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Base URL for Python AI/ML Service
const AI_SERVICE_BASE_URL = import.meta.env.VITE_AI_SERVICE_BASE_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 4000,
    headers: {
        "Content-Type": "application/json",
    },
});

export const aiClient = axios.create({
    baseURL: AI_SERVICE_BASE_URL,
    timeout: 4000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to attach JWT token to backend requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401 response
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            
            // Avoid infinite refresh loop if already on login/register/public report page
            const currentPath = window.location.pathname;
            if (currentPath !== "/login" && currentPath !== "/register" && currentPath !== "/report") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);
