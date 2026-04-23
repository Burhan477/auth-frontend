import axios from "axios";

// Add a fallback || "http://localhost:5000"
const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${baseURL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;