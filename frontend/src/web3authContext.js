import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID;

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x1",
  rpcTarget: import.meta.env.VITE_RPC_TARGET || "https://rpc.ankr.com/eth",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3AuthOptions = {
  chainConfig,
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  enableLogging: true,
  privateKeyProvider,
  uiConfig: {
    loginMethodsOrder: [
      "google",
      "facebook",
      "twitter",
      "discord",
      "github",
      "apple",
    ],
    showExternalWallets: false,
  },
};

const web3AuthContextConfig = {
  web3AuthOptions,
  adapters: [],
};

export default web3AuthContextConfig;
