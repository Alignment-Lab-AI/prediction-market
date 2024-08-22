// src/contexts/GlobalContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchMarkets, fetchConfig } from '../utils/api';

interface GlobalContextType {
  markets: any[];
  config: any;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const defaultContextValue: GlobalContextType = {
  markets: [],
  config: null,
  isInitialLoading: true,
  isRefreshing: false,
  error: null,
  refreshData: async () => {},
};

const GlobalContext = createContext<GlobalContextType>(defaultContextValue);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [markets, setMarkets] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [marketsData, configData] = await Promise.all([
        fetchMarkets(),
        fetchConfig()
      ]);
      setMarkets(marketsData);
      setConfig(configData);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('Failed to fetch data. Please try again later.');
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    const initialFetch = async () => {
      await fetchData();
      setIsInitialLoading(false);
    };

    initialFetch();
  }, []);

  return (
    <GlobalContext.Provider value={{ markets, config, isInitialLoading, isRefreshing, error, refreshData }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};