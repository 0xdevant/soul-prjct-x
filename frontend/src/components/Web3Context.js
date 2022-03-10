import { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";

//import Marketplace from "../../artifacts/contracts/Marketplace.sol/Marketplace.json";

export const Web3Context = createContext();
//const oneEther = ethers.BigNumber.from("1000000000000000000");

const Web3Provider = ({ children }) => {
  const HARDHAT_NETWORK_ID = "31337";
  const CURRENT_NETWORK_ID = "1";

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
    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      if (newAddress === undefined) {
        return _resetState();
      }

      _initialize(newAddress);
    });

    // We reset the site state if the network is changed
    window.ethereum.on("chainChanged", (chainId) => {
      console.log("NetworkID: " + chainId);
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

    // Once we have the address, we can initialize the application.
    // First we check the network
    if (!_checkNetwork()) {
      return;
    }

    _initialize(selectedAddress);
  }

  function _initialize(userAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    /*const contract = new ethers.Contract(
        contractAddress.Token,
        TokenArtifact.abi,
        signer
      );*/
    setProvider(provider);
    setContract("");
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

  // This method checks if Metamask selected network is on ETH
  function _checkNetwork() {
    if (window.ethereum.networkVersion === CURRENT_NETWORK_ID) {
      return true;
    }

    setAlertType("error");
    setAlert("Please connect Metamask to the Ethereum network");

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
