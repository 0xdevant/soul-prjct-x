const chai = require("chai");
const { expect } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { MerkleTree } = require("merkletreejs");
const { keccak256 } = ethers.utils;

chai.use(chaiAsPromised);

describe("PRJCT-X contract", function () {
  let PRJCTX;
  let prjctx;
  let MINT_PRICE = 0.08;
  let accounts;

  function getMintPrice(mintAmount) {
    return ethers.utils.parseEther(MINT_PRICE.toString()).mul(mintAmount);
  }

  beforeEach(async () => {
    PRJCTX = await ethers.getContractFactory("PRJCTX");
    accounts = await ethers.getSigners();

    prjctx = await PRJCTX.deploy();
    await prjctx.deployed();
  });

  it("allow only whitelisted accounts to mint and with correct amount of Ethers", async () => {
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
    ).to.be.rejectedWith(
      Error,
      "insufficient funds for intrinsic transaction cost"
    );

    // mint with correct amount of ether
    await prjctx.connect(whitelisted[2]).whiteListMint(merkleProof, 3, {
      value: getMintPrice(3),
    });
    // trying to mint twice with the same WL address
    await expect(prjctx.connect(whitelisted[2]).whiteListMint(merkleProof, 1), {
      value: getMintPrice(1),
    }).to.be.revertedWith("Address already claimed!");

    /*await expect(
      prjctx.connect(notWhitelisted[0]).whiteListMint(invalidMerkleProof, 2),
      {
        value: getMintPrice(2),
      }
    ).to.be.revertedWith("Invalid proof!");*/
  });

  it("not allow normal mint while whitelist mint is open", async () => {
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

    const testAccounts = accounts.slice(0, 400); // account 1 - 400

    expect(prjctx.connect(testAccounts[4]).mint(21)).to.be.revertedWith(
      "Invalid mint amount!"
    );

    // 400 accounts mint 5 each => 2000 sold
    for (account of testAccounts) {
      await prjctx.connect(account).mint(5, {
        value: getMintPrice(5),
      });
    }

    // after another 20 mints, total supply is 2020 now
    await prjctx.connect(testAccounts[6]).mint(20, {
      value: getMintPrice(20),
    });

    // next transaction cannot mint an amount that exceeds max supply
    expect(prjctx.connect(testAccounts[8]).mint(20)).to.be.revertedWith(
      "Max supply exceeded!"
    );
  });
});
