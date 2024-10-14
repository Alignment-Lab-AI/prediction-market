// src/contexts/Web3Context.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Window as KeplrWindow } from "@keplr-wallet/types";

declare global {
  interface Window extends KeplrWindow { }
}

interface Web3ContextType {
  isWalletConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// const COMDEX_CHAIN_ID = "comdex-1"; // Use the correct Comdex chain ID
const OSMO_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.keplr !== "undefined") {
      try {
        // Suggest the Comdex chain to Keplr
        await window.keplr.experimentalSuggestChain({
          chainId: OSMO_CHAIN_ID,
          chainName: "Osmosis T",
          rpc: "https://rpc.testnet.osmosis.zone",
          rest: "https://lcd.testnet.osmosis.zone",
          bip44: {
            coinType: 118,
          },
          bech32Config: {
            bech32PrefixAccAddr: "osmo",
            bech32PrefixAccPub: "osmopub",
            bech32PrefixValAddr: "osmovaloper",
            bech32PrefixValPub: "osmovaloperpub",
            bech32PrefixConsAddr: "osmovalcons",
            bech32PrefixConsPub: "osmovalconspub",
          },
          currencies: [
            {
              coinDenom: "OSMO",
              coinMinimalDenom: "uosmo",
              coinDecimals: 6,
            },
          ],
          feeCurrencies: [
            {
              coinDenom: "OSMO",
              coinMinimalDenom: "uosmo",
              coinDecimals: 6,
            },
          ],
          stakeCurrency: {
            coinDenom: "OSMO",
            coinMinimalDenom: "uosmo",
            coinDecimals: 6,
          },
        });

        await window.keplr.enable(OSMO_CHAIN_ID);
        const offlineSigner = window.keplr.getOfflineSigner(OSMO_CHAIN_ID);
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