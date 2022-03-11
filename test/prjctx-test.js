const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Prjctx", function () {
  let prjctx;

  before(async () => {
    const Prjctx = await ethers.getContractFactory("Prjctx");
    prjctx = await Prjctx.deploy();
    await prjctx.deployed();
  });

  it("Should return true only for any whitelisted users in the array", async function () {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const whitelistUsersTx = await prjctx.whitelistUsers([
      addr1.address,
      addr2.address,
    ]);
    await whitelistUsersTx.wait();

    const isAddr1WLed = await prjctx.isWhitelisted(addr1.address);
    expect(isAddr1WLed.to.equal(true));
    //expect(await prjctx.isWhitelisted(addr3.address).to.equal(false));

    //const setGreetingTx = await prjctx.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    //await setGreetingTx.wait();

    //expect(await prjctx.greet()).to.equal("Hola, mundo!");
  });

  /*it("Should not let any users mint without activiating the mint", async function () {
    const MINT_COUNT = 3;
    //const [owner, addr1] = await ethers.getSigners();
    expect(await prjctx.mint(MINT_COUNT).to.be.reverted);
  });*/
});
