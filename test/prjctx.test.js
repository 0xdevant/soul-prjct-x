const { expect } = require("chai");
const { MerkleTree } = require("merkletreejs");
const { keccak256 } = ethers.utils;

describe("PRJCTX", function () {
  let prjctx;
  let MINT_PRICE = 0.08;

  beforeEach(async () => {
    const PRJCTX = await ethers.getContractFactory("PRJCTX");
    prjctx = await PRJCTX.deploy();
    await prjctx.deployed();
  });

  /*it("allow only whitelisted accounts to mint and with correct amount of Ethers", async () => {
    const accounts = await hre.ethers.getSigners();
    const whitelisted = accounts.slice(0, 5); // account 1 - 5
    const notWhitelisted = accounts.slice(5, 10); // account 6 - 10

    const leaves = whitelisted.map((account) => keccak256(account.address));
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const merkleRoot = tree.getHexRoot();

    await prjctx.setMerkleRoot(merkleRoot);

    const merkleProof = tree.getHexProof(keccak256(whitelisted[2].address)); // take whitelisted account 3 as an example
    const invalidMerkleProof = tree.getHexProof(
      keccak256(notWhitelisted[0].address)
    );

    // enable whitelist mint
    await prjctx.setWhitelistMintEnabled(true);

    // mint without paying ether
    await expect(
      prjctx.connect(whitelisted[2]).whiteListMint(merkleProof, 3)
    ).to.be.revertedWith("Insufficient funds!");

    // mint with correct amount of ether
    await prjctx.connect(whitelisted[2]).whiteListMint(merkleProof, 3, {
      value: ethers.utils.parseEther((MINT_PRICE * 3).toString()),
    });

    await expect(
      prjctx.connect(whitelisted[2]).whiteListMint(merkleProof, 2)
    ).to.be.revertedWith("Address already claimed!");

    await expect(
      prjctx.connect(notWhitelisted[0]).whiteListMint(invalidMerkleProof, 2)
    ).to.be.revertedWith("Invalid proof!");
  });*/

  it("not allow normal mint while whitelist mint is open", async () => {
    const accounts = await hre.ethers.getSigners();
    const testAccounts = accounts.slice(0, 5); // account 1 - 5

    // enable whitelist mint
    await prjctx.setWhitelistMintEnabled(true);
    expect(prjctx.connect(testAccounts[2]).mint(3)).to.be.revertedWith(
      "The contract is paused!"
    );
  });

  it("not allow when mint amount is less than equal 0 or more than 20, or total supply exceeds max supply", async () => {
    // enable public mint
    await prjctx.setPaused(false);

    const accounts = await hre.ethers.getSigners();
    const testAccounts = accounts.slice(0, 400); // account 1 - 400

    expect(prjctx.connect(testAccounts[4]).mint(21)).to.be.revertedWith(
      "Invalid mint amount!"
    );

    // 400 accounts mint 5 each => 2000 sold
    for (account of testAccounts) {
      await prjctx.connect(account).mint(5, {
        value: ethers.utils.parseEther((MINT_PRICE * 5).toString()),
      });
    }

    // after another 20 mints, total supply is 2020 now
    await prjctx.connect(testAccounts[6]).mint(20, {
      value: ethers.utils.parseEther((MINT_PRICE * 20).toString()),
    });

    // next transaction cannot mint an amount that exceeds max supply
    expect(prjctx.connect(testAccounts[8]).mint(20)).to.be.revertedWith(
      "Max supply exceeded!"
    );
  });
});
