import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://status-backend-txna.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Auth APIs
export const loginUser = (credentials) => api.post('/users/login', credentials);
export const registerUser = (userData) => api.post('/users/register', userData);
export const loginAdmin = (credentials) => api.post('/admin/login', credentials);
export const registerAdmin = (userData) => api.post('/admin/register', userData);

// Service APIs
export const getServices = () => api.get('/services');
export const createService = (serviceData) => api.post('/services', serviceData);
export const updateService = (id, serviceData) => api.put(`/services/${id}`, serviceData);
export const deleteService = (id) => api.delete(`/services/${id}`);
export const getServiceStatus = (id) => api.get(`/services/${id}/status`);
export const getServiceLogs = (id) => api.get(`/services/${id}/logs`);

// Incident Management APIs
export const getAllIncidents = () => api.get('/incidents');
export const createIncident = (incidentData) => api.post('/incidents', incidentData);
export const getIncident = (id) => api.get(`/incidents/${id}`);
export const updateIncident = (id, incidentData) => api.put(`/incidents/${id}`, incidentData);
export const deleteIncident = (id) => api.delete(`/incidents/${id}`);
export const resolveIncident = (id) => api.patch(`/incidents/${id}/resolve`);

// AI Features APIs
export const generateIncidentSummary = (id) => api.post(`/incidents/${id}/generate-summary`);
export const getServiceHealthSummary = (serviceId, days = 7) => api.get(`/incidents/service/${serviceId}/health-summary?days=${days}`);
export const autoDetectIncidents = (serviceId, thresholdMinutes = 5) => api.post(`/incidents/service/${serviceId}/auto-detect?thresholdMinutes=${thresholdMinutes}`);

// Enhanced Analytics APIs
export const getServiceAnalytics = (serviceId, days = 30) => api.get(`/services/${serviceId}/analytics?days=${days}`);
export const getServiceIncidents = (serviceId) => api.get(`/services/${serviceId}/incidents`);

export default api;