const { expect } = require("chai");
const { MerkleTree } = require("merkletreejs");
const { keccak256 } = ethers.utils;

describe("PRJCTX", function () {
  let prjctx;

  beforeEach(async () => {
    const PRJCTX = await ethers.getContractFactory("PRJCTX");
    prjctx = await PRJCTX.deploy();
    await prjctx.deployed();

    // activiate the sale
    await prjctx.setPaused(false);
  });

  it("allow only whitelisted accounts to mint", async () => {
    const accounts = await hre.ethers.getSigners();
    const whitelisted = accounts.slice(0, 5); // account 1 - 4
    const notWhitelisted = accounts.slice(5, 10); // account 5-9

    const leaves = whitelisted.map((account) => keccak256(account.address));
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const merkleRoot = tree.getHexRoot();

    await prjctx.setMerkleRoot(merkleRoot);

    const merkleProof = tree.getHexProof(keccak256(whitelisted[0].address));
    const invalidMerkleProof = tree.getHexProof(
      keccak256(notWhitelisted[0].address)
    );

    await prjctx.setOnlyWhitelisted(true);

    await prjctx.whiteListMint(merkleProof, 3);
    //expect("whiteListMint").to.be.calledOnContractWith(prjctx, merkleProof);;
    await expect(prjctx.whiteListMint(merkleProof, 2)).to.be.revertedWith(
      "Address has already claimed WL"
    );
    await expect(
      prjctx.connect(notWhitelisted[0]).whiteListMint(invalidMerkleProof, 2)
    ).to.be.revertedWith("MerkleProofInvalid");
  });
});
