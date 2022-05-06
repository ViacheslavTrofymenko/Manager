const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Manager contract", function () {
let owner, acc1, acc2, acc3, acc4, manager, skyToken;

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
  })

  it("should be succesfully deployed", async function() {
    expect(manager.address).to.be.properAddress;    
  })

  it("allows to deposite ERC20 tokens", async function() {
    const tx = await skyToken.transfer(acc1.address, 100);
    const tx2 = await skyToken.connect(acc1).approve(manager.address, 100);

    await manager.connect(acc1).depositTokens(2);
    const balanceOf = await manager.balanceOfManager();
    expect(balanceOf).to.equal(2);
    
    await expect(manager.connect(acc1).depositTokens(5))
    .to.be.revertedWith("1 SkyNFT = 2 SKY tokens"); 
    
    await skyToken.connect(acc2).approve(manager.address, 100);
    await expect(manager.connect(acc2).depositTokens(2))
    .to.be.revertedWith("Not enough tokens");

    await skyToken.transfer(acc3.address, 10);
    await expect(manager.connect(acc3).depositTokens(2))
    .to.be.revertedWith("check allowance!");
  })

  it("allows to mint NFT", async function(){
    await skyToken.transfer(acc1.address, 100);
    await skyToken.connect(acc1).approve(manager.address, 100);
    await manager.connect(acc1).depositTokens(2);

    await expect(manager.mintSkyNft())
    .to.be.revertedWith("Nft is still locked");


    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;

    await ethers.provider.send('evm_increaseTime', [60]);
    await ethers.provider.send('evm_mine');

    const blockNumAfter = await ethers.provider.getBlockNumber();

    const blockAfter = await ethers.provider.getBlock(blockNumAfter);
    const timestampAfter = blockAfter.timestamp;

    expect(blockNumAfter).to.be.equal(blockNumBefore + 1);
    expect(timestampAfter).to.be.equal(timestampBefore + 60);

    await expect(manager.mintSkyNft())
    .to.be.revertedWith("First send 2 SKY tokens");
    
    const tx = await manager.connect(acc1).mintSkyNft();
  })

  it("should allow withdraw ERC20 tokens to the owner adress from Manager smart contract", async function() {
    await skyToken.transfer(acc1.address, 100);
    await skyToken.connect(acc1).approve(manager.address, 100);
    await manager.connect(acc1).depositTokens(2);
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;

    await ethers.provider.send('evm_increaseTime', [60]);
    await ethers.provider.send('evm_mine');

    const blockNumAfter = await ethers.provider.getBlockNumber();

    const blockAfter = await ethers.provider.getBlock(blockNumAfter);
    const timestampAfter = blockAfter.timestamp;

    const tx = await manager.connect(acc1).mintSkyNft();
    
    await expect(manager.withdraw(owner.address, 12)).to.be.revertedWith("balance is low");

    await expect(() => manager.withdraw(owner.address, 2))
    .to.changeTokenBalance(skyToken, owner, 2);

    await expect(manager.connect(acc3).withdraw(owner.address, 2)).to.be.revertedWith("Ownable: caller is not the owner");    
  })
})

  
    
      

