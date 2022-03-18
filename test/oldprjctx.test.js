const { expect } = require("chai");

describe("Old PRJCTX", function () {
  let oldprjctx;

  beforeEach(async () => {
    const OLDPRJCTX = await ethers.getContractFactory("OLDprjctx");
    oldprjctx = await OLDPRJCTX.deploy();
    await oldprjctx.deployed();

    // activiate the sale
    await oldprjctx.setPaused(false);
  });

  it("normal mint", async () => {
    const accounts = await hre.ethers.getSigners();
    const testAccounts = accounts.slice(0, 5); // account 1 - 4

    //await oldprjctx.connect(testAccounts[2]).mint(2);

    await oldprjctx.mint(3);
  });
});
