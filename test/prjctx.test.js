const chai = require("chai");
const { expect } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { MerkleTree } = require("merkletreejs");
const { collectionConfig } = require("../config/collectionConfig");
const { keccak256 } = ethers.utils;

chai.use(chaiAsPromised);

function getMintPrice(mintAmount) {
  return ethers.utils
    .parseEther(collectionConfig.price.toString())
    .mul(mintAmount);
}

describe(collectionConfig.contractName, function () {
  let owner;
  let whitelistedUser;
  let holder;
  let externalUser;
  let contract;

  before(async () => {
    [owner, whitelistedUser, holder, externalUser] = await ethers.getSigners();
  });

  it("Contract deployment", async function () {
    const Contract = await ethers.getContractFactory(
      collectionConfig.contractName
    );
    contract = await Contract.deploy();

    await contract.deployed();
  });

  it("Check initial data", async function () {
    expect(await contract.name()).to.equal(collectionConfig.tokenName);
    expect(await contract.symbol()).to.equal(collectionConfig.tokenSymbol);
    expect(await contract.cost()).to.equal(getMintPrice(1));
    expect(await contract.maxSupply()).to.equal(collectionConfig.maxSupply);
    expect(await contract.maxMintAmountPerTx()).to.equal(
      collectionConfig.whitelistSale.maxMintAmountPerTx
    );
    expect(await contract.hiddenMetadataUri()).to.equal(
      collectionConfig.hiddenMetadataUri
    );

    expect(await contract.paused()).to.equal(true);
    expect(await contract.whitelistMintEnabled()).to.equal(false);
    expect(await contract.revealed()).to.equal(false);

    await expect(contract.tokenURI(1)).to.be.revertedWith(
      "ERC721AMetadata: URI query for nonexistent token"
    );
  });

  it("Before any sale", async function () {
    [owner, whitelistedUser, holder, externalUser];

    // Nobody should be able to mint from a paused contract
    await expect(
      contract.connect(whitelistedUser).mint(1, { value: getMintPrice(1) })
    ).to.be.revertedWith("The contract is paused!");
    await expect(
      contract
        .connect(whitelistedUser)
        .whiteListMint([], 1, { value: getMintPrice(1) })
    ).to.be.revertedWith("Whitelist sale is not enabled!");
    await expect(
      contract.connect(holder).mint(1, { value: getMintPrice(1) })
    ).to.be.revertedWith("The contract is paused!");
    await expect(
      contract.connect(holder).whiteListMint([], 1, { value: getMintPrice(1) })
    ).to.be.revertedWith("Whitelist sale is not enabled!");
    await expect(
      contract.connect(owner).mint(1, { value: getMintPrice(1) })
    ).to.be.revertedWith("The contract is paused!");
    await expect(
      contract.connect(owner).whiteListMint([], 1, { value: getMintPrice(1) })
    ).to.be.revertedWith("Whitelist sale is not enabled!");

    // The owner should always be able to run mintForAddress
    await (await contract.mintForAddress(1, await owner.getAddress())).wait();
    await (
      await contract.mintForAddress(1, await whitelistedUser.getAddress())
    ).wait();
    // But not over the maxMintAmountPerTx
    await expect(
      contract.mintForAddress(
        await (await contract.maxMintAmountPerTx()).add(1),
        await holder.getAddress()
      )
    ).to.be.revertedWith("Invalid mint amount!");

    // Check balances
    expect(await contract.balanceOf(await owner.getAddress())).to.equal(1);
    expect(
      await contract.balanceOf(await whitelistedUser.getAddress())
    ).to.equal(1);
    expect(await contract.balanceOf(await holder.getAddress())).to.equal(0);
    expect(await contract.balanceOf(await externalUser.getAddress())).to.equal(
      0
    );
  });

  it("Allow only whitelisted accounts to mint and with correct amount of Ethers", async () => {
    let accounts = await ethers.getSigners();

    const whitelisted = accounts.slice(0, 5); // account 1 - 5
    const notWhitelisted = accounts.slice(5, 10); // account 6 - 10

    const leaves = whitelisted.map((account) => keccak256(account.address));
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const merkleRoot = tree.getHexRoot();

    await contract.setMerkleRoot(merkleRoot);

    const merkleProof = tree.getHexProof(keccak256(whitelisted[2].address)); // take whitelisted account 3 as an example
    const invalidMerkleProof = tree.getHexProof(
      keccak256(notWhitelisted[0].address)
    );

    // enable whitelist mint
    await contract.setWhitelistMintEnabled(true);

    // mint without paying ether
    await expect(
      contract.connect(whitelisted[2]).whiteListMint(merkleProof, 2)
    ).to.be.rejectedWith(
      Error,
      "insufficient funds for intrinsic transaction cost"
    );

    // mint with correct amount of ether
    await contract.connect(whitelisted[2]).whiteListMint(merkleProof, 2, {
      value: getMintPrice(2),
    });
    // trying to mint twice with the same WL address
    await expect(
      contract.connect(whitelisted[2]).whiteListMint(merkleProof, 1, {
        value: getMintPrice(1),
      })
    ).to.be.revertedWith("Address already claimed!");

    /*await expect(
      contract.connect(notWhitelisted[0]).whiteListMint(invalidMerkleProof, 2),
      {
        value: getMintPrice(2),
      }
    ).to.be.revertedWith("Invalid proof!");*/
  });

  it("Not allow normal mint while whitelist mint is open", async () => {
    let accounts = await ethers.getSigners();
    const testAccounts = accounts.slice(0, 5); // account 1 - 5

    // enable whitelist mint
    await contract.setWhitelistMintEnabled(true);
    expect(contract.connect(testAccounts[2]).mint(3)).to.be.revertedWith(
      "The contract is paused!"
    );
  });

  it("Not allow when mint amount is less than equal 0 or more than 20, or total supply exceeds max supply", async () => {
    // enable public mint
    await contract.setPaused(false);

    let accounts = await ethers.getSigners();
    const testAccounts = accounts.slice(0, 1010); // account 1 - 1010

    expect(contract.connect(testAccounts[4]).mint(3), {
      value: getMintPrice(1),
    }).to.be.revertedWith("Invalid mint amount!");

    // 1010 accounts mint 2 each => 2020 sold
    for (account of testAccounts) {
      await contract.connect(account).mint(2, {
        value: getMintPrice(2),
      });
    }

    // total supply is 2020 now, next mint won't go through because it will exceed max supply
    expect(contract.connect(testAccounts[8]).mint(2), {
      value: getMintPrice(2),
    }).to.be.revertedWith("Max supply exceeded!");
  });
});
