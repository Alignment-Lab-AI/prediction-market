// // src/utils/web3.ts
// import { Window as KeplrWindow } from "@keplr-wallet/types";
// import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

// declare global {
//   interface Window extends KeplrWindow {}
// }

// export const getKeplrWallet = async () => {
//   if (typeof window.keplr !== "undefined") {
//     return window.keplr;
//   }
//   throw new Error("Keplr wallet not found");
// };

// export const connectKeplr = async (chainId: string) => {
//   const keplr = await getKeplrWallet();
//   await keplr.enable(chainId);
//   const offlineSigner = keplr.getOfflineSigner(chainId);
//   const accounts = await offlineSigner.getAccounts();
//   return { offlineSigner, accounts };
// };


// export const broadcastTransaction = async (
//     chainId: string,
//     messages: any[],
//     memo: string = ""
//   ) => {
//     const { offlineSigner, accounts } = await connectKeplr(chainId);
//     const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
//     if (!rpcEndpoint) {
//       throw new Error("RPC endpoint not defined in environment variables");
//     }
  
//     const client = await SigningCosmWasmClient.connectWithSigner(
//       rpcEndpoint,
//       offlineSigner,
//       { gasPrice: { amount: 0.025, denom: 'ucmdx' } }
//     );
  
//     // Use a fixed gas limit or let the client estimate it
//     const gas = 200000; // Adjust this value based on your contract's needs
  
//     return client.signAndBroadcast(
//       accounts[0].address,
//       messages,
//       {
//         amount: [{ amount: '5000', denom: 'ucmdx' }], // Adjust the amount as needed
//         gas: gas.toString(),
//       },
//       memo
//     );
//   };


// import { Window as KeplrWindow } from "@keplr-wallet/types";
// import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
// import { GasPrice } from "@cosmjs/stargate";

// declare global {
//   interface Window extends KeplrWindow {}
// }

// export const getKeplrWallet = async () => {
//   if (typeof window.keplr !== "undefined") {
//     return window.keplr;
//   }
//   throw new Error("Keplr wallet not found");
// };

// export const connectKeplr = async (chainId: string) => {
//   const keplr = await getKeplrWallet();
//   await keplr.enable(chainId);
//   const offlineSigner = keplr.getOfflineSigner(chainId);
//   const accounts = await offlineSigner.getAccounts();
//   return { offlineSigner, accounts };
// };

// export const broadcastTransaction = async (
//   chainId: string,
//   messages: any[],
//   memo: string = ""
// ) => {
//   const { offlineSigner, accounts } = await connectKeplr(chainId);
//   const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
//   if (!rpcEndpoint) {
//     throw new Error("RPC endpoint not defined in environment variables");
//   }

//   const client = await SigningCosmWasmClient.connectWithSigner(
//     rpcEndpoint,
//     offlineSigner,
//     { gasPrice: GasPrice.fromString('0.025ucmdx') }
//   );

//   const { sender, contract, msg, funds } = messages[0].value;
  
//   return client.execute(
//     sender,
//     contract,
//     JSON.parse(Buffer.from(msg, 'base64').toString()),
//     "auto",
//     memo,
//     funds
//   );
// };

import { Window as KeplrWindow } from "@keplr-wallet/types";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice, calculateFee, StdFee, DeliverTxResponse } from "@cosmjs/stargate";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";


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
    messages: any[],
    memo: string = ""
  ): Promise<DeliverTxResponse> => {
    try {
      const { offlineSigner, accounts } = await connectKeplr(chainId);
      const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
      if (!rpcEndpoint) {
        throw new Error("RPC endpoint not defined in environment variables");
      }
  
      const gasPrice = GasPrice.fromString('0.025ucmdx');
      const client = await SigningCosmWasmClient.connectWithSigner(
        rpcEndpoint,
        offlineSigner,
        { gasPrice }
      );
  
      const { sender, contract, msg, funds } = messages[0].value;
      const parsedMsg = JSON.parse(Buffer.from(msg, 'base64').toString());
  
      console.log("Executing transaction with message:", safeStringify(parsedMsg));
  
      // Estimate the gas
      const gasEstimation = await client.simulate(sender, [{
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: {
          sender,
          contract,
          msg: Buffer.from(JSON.stringify(parsedMsg)),
          funds,
        },
      }], memo);
  
      // Calculate the fee with a 1.3 adjustment factor
      const fee: StdFee = calculateFee(Math.round(gasEstimation * 1.3), gasPrice);
  
      console.log("Estimated fee:", safeStringify(fee));
  
      const result = await client.execute(
        sender,
        contract,
        parsedMsg,
        fee,
        memo,
        funds
      );
  
      console.log("Transaction result:", safeStringify(result));
  
      if (result.code !== undefined && result.code !== 0) {
        throw new Error(`Transaction failed with code ${result.code}: ${result.rawLog}`);
      }
  
      return result;
    } catch (error) {
      console.error("Error in broadcastTransaction:", error);
      throw error; // Re-throw the error to be caught by the calling function
    }
  };

  const safeStringify = (obj: any) => {
    return JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value
    );
  };