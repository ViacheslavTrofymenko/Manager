const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC721 SkyNftFactory", function () {
let owner, acc1, acc2, acc3, acc4, skyNft;

  beforeEach(async function() {
    [owner, acc1, acc2, acc3, acc4] = await ethers.getSigners();
    const SkyNft = await ethers.getContractFactory("SkyNftFactory", owner);
    skyNft = await SkyNft.deploy();
    await skyNft.deployed();   
  })

    it("should be succesfully deployed", async function() {
      expect(skyNft.address).to.be.properAddress;
      console.log("Success!!!")
    })

    it("has a name", async function() {
      expect(await skyNft.name()).to.equal('SkyNftoken')
    })

    it("has a symbol", async function() {
      expect(await skyNft.symbol()).to.equal('SNFT')
    })

    it("should be possible to mint new NFT with required NFT field", async function() {
      await skyNft.safeMint(acc1.address);
      await skyNft.safeMint(acc1.address);


      expect(await skyNft.balanceOf(acc1.address))
      .to.equal(2);
      expect(await skyNft.ownerOf(0)).to.equal(acc1.address);
      console.log(await skyNft.skyNfts(0));
    })

})