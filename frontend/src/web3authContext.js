import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";

const clientId =
  "BCYyGA2ohL6R7jt1X37YDx52xiAXOnbnXQZsROAyF0YQ2G8Uf6RFA78ngA0Knn1CZMWpC75Kp8n7AzKO2_9fsww";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155, // Mesmo que não funcione na Sonic
  chainId: "0x1", // Mantemos Ethereum para o Web3Auth funcionar
  rpcTarget: "https://rpc.ankr.com/eth",
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

const adapters = getDefaultExternalAdapters({ options: web3AuthOptions });

const web3AuthContextConfig = {
  web3AuthOptions,
  adapters: [],
};

export default web3AuthContextConfig;
