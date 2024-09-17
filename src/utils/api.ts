import axios from 'axios';
import { encodeQuery } from './queryUtils';

const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const fetchMarkets = async () => {
  console.log("Fetching markets...");
  try {
    const query = {
      markets: {
        status: "Active",
        start_after: 0,
        limit: 10
      }
    };
    const encodedQuery = encodeQuery(query);
    const response = await axios.get(
      `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
    );
    console.log("Markets fetched successfully:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching markets:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchConfig = async () => {
  console.log("Fetching config...");
  try {
    const query = {
      config: {}
    };
    const encodedQuery = encodeQuery(query);
    const response = await axios.get(
      `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
    );
    console.log("Config fetched successfully:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching config:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getWhitelistedAddresses = async () => {
  console.log("Fetching whitelisted addresses...");
  try {
    const query = {
      get_all_whitelisted_addresses: {}
    };
    const encodedQuery = encodeQuery(query);
    const response = await axios.get(
      `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
    );
    console.log("Whitelisted addresses fetched successfully:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching whitelisted addresses:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to fetch a specific market
export const fetchMarket = async (marketId: number) => {
  console.log(`Fetching market with ID ${marketId}...`);
  try {
    const query = {
      query_market: {
        id: marketId
      }
    };
    const encodedQuery = encodeQuery(query);
    const response = await axios.get(
      `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
    );
    console.log("Market fetched successfully:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching market:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getRealConfig = async () => {
    console.log("Fetching real config...");
    try {
      const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
      const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      
      const query = {
        config: {}
      };
      const encodedQuery = encodeQuery(query);
  
      const response = await axios.get(
        `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
      );
      console.log("Real config fetched successfully:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching real config:", error.response ? error.response.data : error.message);
      throw error;
    }
  };