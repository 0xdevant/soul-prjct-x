import React, { useContext, useState } from "react";
import { ConnectWallet } from "./ConnectWallet";
import MintSelector from "./MintSelector";
import { Web3Context } from "./Web3Context";

function MintBox() {
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

  return (
    <div className="bg-secondary-theme rounded-md p-8 flex justify-center items-center w-1/2 mx-auto text-black">
      <div className="flex flex-col space-y-8">
        <h2 className="text-3xl font-bold text-white">Mint Details</h2>
        <div className="flex items-center space-x-4 text-white">
          <div className="">PRICE</div>
          <div className="">SUPPLY</div>
          <div className="">DATE</div>
        </div>
        {!account && <ConnectWallet connectWallet={_connectWallet} />}
        {account && <MintSelector />}
      </div>
    </div>
  );
}

export default MintBox;
