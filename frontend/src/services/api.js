import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT authentication token in headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bite_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const loginUser = async (credentials) => {
  const { data } = await API.post('/auth/login', credentials);
  return data;
};

export const registerUser = async (userData) => {
  const { data } = await API.post('/auth/register', userData);
  return data;
};

export const fetchProfile = async () => {
  const { data } = await API.get('/auth/me');
  return data;
};

export const updateProfile = async (profileData) => {
  const { data } = await API.put('/auth/profile', profileData);
  return data;
};

// Meals Endpoints
export const fetchLoggedMeals = async (date) => {
  const { data } = await API.get(`/meals?date=${date}`);
  return data;
};

export const logMeal = async (mealData) => {
  const { data } = await API.post('/meals', mealData);
  return data;
};

export const deleteMeal = async (id) => {
  const { data } = await API.delete(`/meals/${id}`);
  return data;
};

export const searchMeals = async (query) => {
  const { data } = await API.get(`/meals/search?query=${encodeURIComponent(query)}`);
  return data;
};

export const scanBarcode = async (code) => {
  const { data } = await API.get(`/meals/barcode/${code}`);
  return data;
};

// Water Endpoints
export const fetchWaterIntake = async (date) => {
  const { data } = await API.get(`/water?date=${date}`);
  return data;
};

export const logWater = async (waterData) => {
  const { data } = await API.post('/water', waterData);
  return data;
};

export const deleteWater = async (id) => {
  const { data } = await API.delete(`/water/${id}`);
  return data;
};

// AI Suggestions & Coach Endpoints
export const fetchAISuggestions = async () => {
  const { data } = await API.get('/ai/suggestions');
  return data;
};

export const fetchAIAnalytics = async () => {
  const { data } = await API.get('/ai/analytics');
  return data;
};

export default API;
