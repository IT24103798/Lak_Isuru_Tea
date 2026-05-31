import axios from "axios";

export const API_BASE_URL = "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem("userInfo");

  if (userInfo) {
    const parsedUser = JSON.parse(userInfo);
    req.headers.Authorization = `Bearer ${parsedUser.token}`;
  }

  return req;
});

export const apiRequest = async (path, options = {}) => {
  const userInfo = localStorage.getItem("userInfo");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (userInfo) {
    const parsedUser = JSON.parse(userInfo);
    headers.Authorization = `Bearer ${parsedUser.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
};

export default API;
