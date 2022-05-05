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
        expect(await skyToken.decimals()).to.equal(decimals);
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

      it('should be possible to buy token directly from smart contract', async function() {
        const tokenAmount = 2;
        const tx = await skyToken.connect(acc1).buyToken(tokenAmount, {value: ethers.utils.parseEther("0.0002")});

        expect(await skyToken.balanceOf(acc1.address)).to.equal(2);

        await expect(skyToken.connect(acc2).buyToken(tokenAmount, {value: ethers.utils.parseEther("0.0001")}))
        .to.be.revertedWith('Check the value')

        await expect(() => tx).
          to.changeEtherBalance(skyToken, ethers.utils.parseEther("0.0002"))
      })

      it('should only owner can withdraw from this contract', async function(){
        const tx = await skyToken.connect(acc1).buyToken(2, {value: ethers.utils.parseEther("0.0002")});
        console.log(await skyToken.getBalance());
        const tx2 = await skyToken.withdraw(owner.address);
        console.log(await skyToken.getBalance());

        const tx3 = await skyToken.connect(acc2).buyToken(2, {value: ethers.utils.parseEther("0.0002")});

        await expect(skyToken.connect(acc1).withdraw(acc1.address))
          .to.be.revertedWith("You are not the owner")        
      })

    }) 
})
