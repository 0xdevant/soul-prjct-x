import React, { useContext, useState } from "react";
import { Web3Context } from "./Web3Context";

function MintSelector() {
  const {
    ethers,
    provider,
    contract,
    account,
    alert,
    alertType,
    _connectWallet,
    _dismissError,
    _resetState,
  } = useContext(Web3Context);

  // 0.08 ETH
  const MINT_PRICE = 0.08;
  const [mintAmount, setMintAmount] = useState(1);

  function handleMintAmount(e) {
    setMintAmount(e.target.value);
  }

  async function mint() {
    if (!account) {
      _connectWallet();
      return;
    }
    try {
      await contract.mint(mintAmount, {
        value: ethers.utils.parseEther((MINT_PRICE * mintAmount).toString()),
        gasLimit: 80000,
      });
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="flex space-x-4">
      <select
        className="rounded-md w-14 text-center"
        name="mintAmount"
        id="mintAmount"
        onChange={handleMintAmount}
        defaultValue="1"
      >
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select>
      <button className="mint-button" onClick={mint}>
        Mint Now
      </button>
    </div>
  );
}

export default MintSelector;
