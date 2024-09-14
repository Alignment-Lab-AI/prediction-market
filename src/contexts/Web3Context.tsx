// src/contexts/Web3Context.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Window as KeplrWindow } from "@keplr-wallet/types";

declare global {
  interface Window extends KeplrWindow {}
}

interface Web3ContextType {
  isWalletConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const COMDEX_CHAIN_ID = "comdex-1"; // Use the correct Comdex chain ID

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.keplr !== "undefined") {
      try {
        // Suggest the Comdex chain to Keplr
        await window.keplr.experimentalSuggestChain({
          chainId: COMDEX_CHAIN_ID,
          chainName: "Comdex",
          rpc: "https://rpc.comdex.one",
          rest: "https://rest.comdex.one",
          bip44: {
            coinType: 118,
          },
          bech32Config: {
            bech32PrefixAccAddr: "comdex",
            bech32PrefixAccPub: "comdexpub",
            bech32PrefixValAddr: "comdexvaloper",
            bech32PrefixValPub: "comdexvaloperpub",
            bech32PrefixConsAddr: "comdexvalcons",
            bech32PrefixConsPub: "comdexvalconspub",
          },
          currencies: [
            {
              coinDenom: "CMDX",
              coinMinimalDenom: "ucmdx",
              coinDecimals: 6,
            },
          ],
          feeCurrencies: [
            {
              coinDenom: "CMDX",
              coinMinimalDenom: "ucmdx",
              coinDecimals: 6,
            },
          ],
          stakeCurrency: {
            coinDenom: "CMDX",
            coinMinimalDenom: "ucmdx",
            coinDecimals: 6,
          },
        });

        await window.keplr.enable(COMDEX_CHAIN_ID);
        const offlineSigner = window.keplr.getOfflineSigner(COMDEX_CHAIN_ID);
        const accounts = await offlineSigner.getAccounts();
        setWalletAddress(accounts[0].address);
        setIsWalletConnected(true);
      } catch (error) {
        console.error("Failed to connect to Keplr wallet:", error);
      }
    } else {
      console.log("Keplr wallet is not installed");
    }
  };

  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress(null);
  };

  useEffect(() => {
    if (typeof window.keplr !== "undefined") {
      window.addEventListener("keplr_keystorechange", connectWallet);
    }
    return () => {
      window.removeEventListener("keplr_keystorechange", connectWallet);
    };
  }, []);

  return (
    <Web3Context.Provider value={{ isWalletConnected, walletAddress, connectWallet, disconnectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};