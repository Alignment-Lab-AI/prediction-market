import { Window as KeplrWindow } from "@keplr-wallet/types";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice, calculateFee, StdFee, DeliverTxResponse, coins } from "@cosmjs/stargate";

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

export const broadcastTransaction = async (
    chainId: string,
    contractAddress: string,
    msg: any,
    funds: { denom: string; amount: string }[]
  ) => {
    try {
      const { offlineSigner, accounts } = await connectKeplr(chainId);
      
      const gasPrice = GasPrice.fromString("0.025ucmdx");
      const gasLimit = 300000;
  
      const client = await SigningCosmWasmClient.connectWithSigner(
        process.env.NEXT_PUBLIC_RPC_ENDPOINT!,
        offlineSigner,
        { gasPrice }
      );
  
      const fee = calculateFee(gasLimit, gasPrice);
      const fundCoins = coins(funds[0].amount, funds[0].denom);
  
      const result = await client.execute(
        accounts[0].address,
        contractAddress,
        msg,
        fee,
        "",  // memo
        fundCoins
      );
  
      return result;
    } catch (error) {
      console.error("Error in broadcastTransaction:", error);
      throw error;
    }
  };