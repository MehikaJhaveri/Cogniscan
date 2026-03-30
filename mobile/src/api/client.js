import axios from 'axios';
import { storage } from '../utils/storage';

// In Expo, environment variables must start with EXPO_PUBLIC_
// Fallback to Android emulator IP if not set
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.removeToken();
      await storage.removeUser();
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
};

// Patient endpoints
export const patientAPI = {
  getProfile: () => api.get('/api/patients/profile'),
  updateProfile: (data) => api.post('/api/patients/profile', data),
  getDashboard: () => api.get('/api/patients/dashboard'),
  getStreak: () => api.get('/api/patients/streak'),
  getDailyQuestion: () => api.get('/api/patients/daily-question'),
  getRecommendations: () => api.get('/api/patients/recommendations'),
};

// Assessment endpoints
export const assessmentAPI = {
  upload: (formData) =>
    api.post('/api/assessments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }),
  submitCognitive: (results) => api.post('/api/assessments/cognitive', results),
  computeRisk: () => api.post('/api/assessments/compute-risk'),
  getHistory: (limit = 30) => api.get(`/api/assessments/history?limit=${limit}`),
};

// Caregiver endpoints
export const caregiverAPI = {
  linkPatient: (linkCode) => api.post('/api/caregivers/link-patient', { link_code: linkCode }),
  getPatients: () => api.get('/api/caregivers/patients'),
  getPatientDashboard: (patientId) => api.get(`/api/caregivers/patients/${patientId}/dashboard`),
  getPatientAlerts: (patientId) => api.get(`/api/caregivers/patients/${patientId}/alerts`),
  getAllAlerts: () => api.get('/api/caregivers/alerts'),
  markAlertRead: (alertId) => api.put(`/api/caregivers/alerts/${alertId}/read`),
  getPatientInsights: (patientId) => api.get(`/api/caregivers/patients/${patientId}/insights`),
  getPatientRecommendations: (patientId) => api.get(`/api/caregivers/patients/${patientId}/recommendations`),
};

export default api;
