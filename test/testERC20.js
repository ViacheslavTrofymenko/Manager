const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC20 SkyToken", function () {
  let owner, acc1, acc2, acc3, acc4, skyToken;
  const name = "SKYToken";
  const symbol = "SKY";
  const decimals = 0;

  beforeEach(async function() {
    [owner, acc1, acc2, acc3, acc4] = await ethers.getSigners();
    const SkyToken = await ethers.getContractFactory("SkyToken", owner);
    skyToken = await SkyToken.deploy();
    await skyToken.deployed();
  })

    describe('Deployment', () => {
      it("should be succesfully deployed", async function() {
        expect(skyToken.address).to.be.properAddress;
        console.log("Success!!!")
      })
  
      it("should have 0 ether by default", async function() {
        const balance = await skyToken.getBalance();
        expect(balance).to.eq(0)
      })

      it('should deploy with total supply of 20K tokens 10K of them supply for the owner', async function() {
        const totalSupply = await skyToken.totalSupply();
        const ownerBalance = await skyToken.balanceOf(owner.address);
        expect(totalSupply).to.eq(20000);
        expect(ownerBalance).to.eq(10000);
      })
    }) 

    describe('Main SkyToken', () => {
      it("has a name", async function() {
        expect(await skyToken.name()).to.equal(name)
      })

      it("has a symbol", async function() {
        expect(await skyToken.symbol()).to.equal(symbol)
      })

      it('has 0 decimals', async function () {
        expect(await this.token.decimals()).to.be.bignumber.equal('0');
      });


      it("should let send token to another account", async function() {
        await skyToken.transfer(acc1.address, 100);
        expect(await skyToken.balanceOf(acc1.address)).to.equal(100)
      })

      it('should let you give another address the approval to send on your behalf', async function() {
        await skyToken.transfer(acc1.address, 100);
        await skyToken.connect(acc1).approve(owner.address, 75);
        await skyToken.transferFrom(acc1.address, acc2.address, 75);
        expect(await skyToken.balanceOf(acc2.address)).to.eq(75);
        await expect(skyToken.transferFrom(acc1.address, acc2.address, 5)).to.be.reverted;
      })
  
    }) 
})
