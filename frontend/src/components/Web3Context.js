import { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";

import PRJCTX from "../contracts/contracts/PRJCTX.sol/PRJCTX.json";

export const Web3Context = createContext();
//const oneEther = ethers.BigNumber.from("1000000000000000000");

const Web3Provider = ({ children }) => {
  const HARDHAT_CHAIN_ID = "0x7a69";
  const ETHEREUM_ROPSTEN_CHAIN_ID = "0x3";
  const ETHEREUM_RINKEBY_CHAIN_ID = "0x4";
  const ETHEREUM_MAINNET_CHAIN_ID = "0x1";
  const CURRENT_CHAIN_ID = "0x3";

  const [provider, setProvider] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [alertType, setAlertType] = useState("error");
  const [alert, setAlert] = useState(undefined);

  // Fetch user account if already connected previously
  useEffect(() => {
    async function fetchConnectedETH() {
      if (window.ethereum === undefined) {
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const [accounts] = await provider.listAccounts();
      if (accounts !== undefined) {
        _initialize(accounts);
      }
    }
    fetchConnectedETH();
  }, []);

  useEffect(() => {
    if (window.ethereum === undefined) {
      return;
    }
    // Reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      if (newAddress === undefined) {
        return _resetState();
      }

      _initialize(newAddress);
    });

    // Reset the site state if the network is changed
    window.ethereum.on("chainChanged", (chainId) => {
      console.log(`Network ID changed to: ${chainId}`);
      _resetState();
    });
  });

  async function _connectWallet() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      setAlertType("error");
      setAlert("Please install MetaMask!");
      return;
    }

    // Checks if selected network is on desired network
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (!_checkNetwork(chainId)) {
      _resetState();
      setAlert(`Please switch to network ID ${CURRENT_CHAIN_ID}`);
      return;
    }

    const [selectedAddress] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    _initialize(selectedAddress);
  }

  async function _initialize(userAddress) {
    // Get the current chainId, invoke the corresponding contract
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contractAddress;
    if (chainId === HARDHAT_CHAIN_ID) {
      contractAddress = "";
    } else if (chainId === ETHEREUM_ROPSTEN_CHAIN_ID) {
      contractAddress = "0x5E4a3c58e50ef8A49DbdF96BdD8eD604F18eeaAe";
    } else if (chainId === ETHEREUM_RINKEBY_CHAIN_ID) {
      contractAddress = "0x4935d96708cF6156763E1f2265eaa1F0E33B47E4";
    } else if (chainId === ETHEREUM_MAINNET_CHAIN_ID) {
      contractAddress = "";
    }
    const contract = new ethers.Contract(contractAddress, PRJCTX.abi, signer);

    setProvider(provider);
    setContract(contract);
    setAccount(userAddress);
  }

  function _dismissError() {
    setAlertType("error");
    setAlert(undefined);
  }

  function _resetState() {
    setProvider(undefined);
    setContract(undefined);
    setAccount(undefined);
    setAlertType("error");
    setAlert(undefined);
  }

  // Checks if selected network is on desired network
  function _checkNetwork(chainId) {
    if (chainId === CURRENT_CHAIN_ID) {
      return true;
    }

    return false;
  }

  return (
    <Web3Context.Provider
      value={{
        ethers,
        provider,
        contract,
        account,
        alertType,
        setAlertType,
        alert,
        setAlert,
        _connectWallet,
        _dismissError,
        _resetState,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;
