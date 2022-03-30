require("dotenv").config();
const path = require("path");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

if (process.env.REPORT_GAS) {
  require("hardhat-gas-reporter");
}

if (process.env.REPORT_COVERAGE) {
  require("solidity-coverage");
}

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.11",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  networks: {
    mainnet: {
      chainId: 1,
      url:
        `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}` || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    ropsten: {
      chainId: 3,
      url:
        `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}` || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    rinkeby: {
      chainId: 4,
      url:
        `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}` || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 50,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    showTimeSpent: true,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  plugins: ["solidity-coverage"],
};
