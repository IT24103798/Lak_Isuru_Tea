import axios from "axios";

export const API_BASE_URL = "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});

const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");
    const userInfo = localStorage.getItem("userInfo");

    if (user) return JSON.parse(user);
    if (userInfo) return JSON.parse(userInfo);

    return null;
  } catch (error) {
    return null;
  }
};

API.interceptors.request.use((req) => {
  const storedUser = getStoredUser();

  if (storedUser?.token) {
    req.headers.Authorization = `Bearer ${storedUser.token}`;
  }

  return req;
});

export const apiRequest = async (path, options = {}) => {
  const storedUser = getStoredUser();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (storedUser?.token) {
    headers.Authorization = `Bearer ${storedUser.token}`;
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