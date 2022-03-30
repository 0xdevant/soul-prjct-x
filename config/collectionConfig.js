const whitelistAddresses = require("./whitelist.json");

const collectionConfig = {
  contractName: "PRJCTX",
  tokenName: "PRJCT-X",
  tokenSymbol: "PRJCTX",
  hiddenMetadataUri: "ipfs://__CID__/hidden.json",
  price: 0.08,
  maxSupply: 2022,
  whitelistSale: {
    maxMintAmountPerTx: 2,
  },
  publicSale: {
    maxMintAmountPerTx: 5,
  },
  contractAddress: null,
  whitelistAddresses: whitelistAddresses,
};

module.exports = { collectionConfig };
