const { expect } = require("chai");
const { ethers } = require("hardhat");
const tokenJSON = require("../artifacts/contracts/SkyToken.sol/SkyToken.json")

describe("Manager contract", function () {
let owner, acc1, acc2, acc3, acc4, manager, skyToken;
let erc20;

beforeEach(async function() {
    [owner, acc1, acc2, acc3, acc4] = await ethers.getSigners();

    const SkyToken = await ethers.getContractFactory("SkyToken", owner);
    skyToken = await SkyToken.deploy();
    await skyToken.deployed();

    const Manager = await ethers.getContractFactory("Manager", owner);
    manager = await Manager.deploy(
        skyToken.address
    );
    await manager.deployed();
    erc20 = new ethers.Contract(skyToken.address, tokenJSON.abi, owner)
  })

  it("should be succesfully deployed", async function() {
    expect(manager.address).to.be.properAddress;    
  })

  it("allows to deposite ERC20 tokens", async function() {
    const tx = await skyToken.transfer(acc1.address, 100);
    const tx2 = await skyToken.connect(acc1).approve(manager.address, 100);

    const deposite = await manager.connect(acc1).depositTokens(2);
    expect(await manager.balanceOfManager()).to.equal(2)
    
  })

})

  
    
      

