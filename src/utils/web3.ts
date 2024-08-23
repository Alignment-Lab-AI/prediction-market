// src/utils/web3.ts
import { Window as KeplrWindow } from "@keplr-wallet/types";

declare global {
  interface Window extends KeplrWindow {}
}

export const getKeplrWallet = async () => {
  if (typeof window.keplr !== "undefined") {
    return window.keplr;
  }
  throw new Error("Keplr wallet not found");
};

export const connectKeplr = async (chainId: string) => {
  const keplr = await getKeplrWallet();
  await keplr.enable(chainId);
  const offlineSigner = keplr.getOfflineSigner(chainId);
  const accounts = await offlineSigner.getAccounts();
  return { offlineSigner, accounts };
};

// Add more Keplr-specific functions as needed