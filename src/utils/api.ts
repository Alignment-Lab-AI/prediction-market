import axios from 'axios';
import { encodeQuery } from '../utils/queryUtils';

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
const GET_WHITELIST_QUERY = 'eyJnZXRfYWxsX3doaXRlbGlzdGVkX2FkZHJlc3NlcyI6IHt9fQ==';


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

export const getWhitelistedAddresses = async () => {
    console.log("Fetching whitelisted addresses...");
    try {
      const response = await axios.get(
        `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${GET_WHITELIST_QUERY}`
      );
      console.log("Whitelisted addresses fetched successfully:", response.data);
      return response.data.data;  // The API returns an array directly in the 'data' field
    } catch (error) {
      console.error("Error fetching whitelisted addresses:", error.response ? error.response.data : error.message);
      throw error;
    }
  };


// For fetching a specific market
const getMarketQuery = (marketId: number) => {
  const query = {
    get_market: {
      id: marketId
    }
  };
  return encodeQuery(query);
};
