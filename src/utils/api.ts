// src/utils/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const fetchMarkets = async () => {
  console.log("Fetching markets...");
  try {
    const response = await axios.get(`${API_BASE_URL}/markets`);
    console.log("Markets fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching markets:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchConfig = async () => {
  console.log("Fetching config...");
  try {
    const response = await axios.get(`${API_BASE_URL}/config`);
    console.log("Config fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching config:", error.response ? error.response.data : error.message);
    throw error;
  }
};