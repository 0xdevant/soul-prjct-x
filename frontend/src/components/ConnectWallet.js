import React from "react";

export function ConnectWallet({ connectWallet }) {
  return (
    <div className="text-center flex justify-center items-center">
      <button
        className="rounded-full bg-white px-4 py-2 text-black"
        type="button"
        onClick={connectWallet}
      >
        Connect Wallet
      </button>
    </div>
  );
}
