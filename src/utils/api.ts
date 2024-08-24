import axios from 'axios';

// Dummy API
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

// Real API
const REAL_BASE_URL = 'http://localhost:1317';
const CONTRACT_ADDRESS = 'comdex14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9spunaxy';
const GET_CONFIG_QUERY = 'eyJnZXRfY29uZmlnIjoge319';

export const getRealConfig = async () => {
  console.log("Fetching real config...");
  try {
    const response = await axios.get(
      `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${GET_CONFIG_QUERY}`
    );
    console.log("Real config fetched successfully:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching real config:", error.response ? error.response.data : error.message);
    throw error;
  }
};

