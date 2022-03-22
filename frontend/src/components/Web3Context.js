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

  // To fetch user account if already connected previously
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
    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      if (newAddress === undefined) {
        return _resetState();
      }

      _initialize(newAddress);
    });

    // We reset the site state if the network is changed
    window.ethereum.on("chainChanged", (chainId) => {
      console.log(`Network ID changed to: ${chainId}`);
      _resetState();
    });
  });

  async function _connectWallet() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      console.log("Please install MetaMask!");
      setAlertType("error");
      setAlert("Please install MetaMask!");
      return;
    }

    const [selectedAddress] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    // Once we have the address, we can initialize the application.
    // First we check the network
    if (!_checkNetwork(chainId)) {
      return;
    }

    _initialize(selectedAddress, chainId);
  }

  function _initialize(userAddress, chainId) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contractAddress;
    if (chainId === HARDHAT_CHAIN_ID) {
      contractAddress = "";
    } else if (chainId === ETHEREUM_ROPSTEN_CHAIN_ID) {
      contractAddress = "0x1ba56371bDD9FD4ceF5eE54239a34b78B447526c";
    } else if (chainId === ETHEREUM_RINKEBY_CHAIN_ID) {
      contractAddress = "0x2B68Cf203E95b20927ea50992438651C23158094";
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

  // This method checks if Metamask selected network is on desired network
  function _checkNetwork(chainId) {
    if (chainId === CURRENT_CHAIN_ID) {
      return true;
    }
    setAlertType("error");
    setAlert(`Please switch to network ID ${CURRENT_CHAIN_ID}`);

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
