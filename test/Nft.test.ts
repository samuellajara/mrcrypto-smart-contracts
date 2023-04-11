import { expect, assert } from "chai";
import { ethers } from "hardhat";

describe("NFT CONTRACT", function () {

  async function deployNFTFixture() {
    
    const NAME = "MRCRYPTO";
    const SYMBOL = "MRC";
    
    const [owner, admin, user] = await ethers.getSigners();
    const MRCRYPTO = await ethers.getContractFactory("MRCRYPTO");
    const mrc = await MRCRYPTO.deploy(NAME, SYMBOL);
    
    return { owner, admin, user, mrc };
  }

  describe("Mint NFT", function() {
    
    it("Mint an NFT on whitelist", async () => {
      const { admin, user, mrc } = await deployNFTFixture();
      // Add an administrator
      await mrc.addAdmin(admin.address);
      // The admin adds the user to the WhiteList
      await mrc.connect(admin).addToWhitelist(user.address);
      await mrc.connect(admin).addToWhitelist(admin.address); // Se añade a si mismo
      // Un-pause the contract
      await mrc.connect(admin).flipPause();
      // Check that the user is in the whitelist
      assert(await mrc.isWhitelisted(user.address) == true);
      // Call the contract to mint
      await mrc.connect(user).mint(1, {value: ethers.utils.parseEther("0.001")});
    }) 

    it("URI is returned correctly", async () => {
      const { mrc, admin } = await deployNFTFixture();
      // Add an administrator
      await mrc.addAdmin(admin.address);
      // Not revealed uri
      assert(await mrc.connect(admin).tokenURI(1) === "Not revelated");
      // Revealed uri
      await mrc.connect(admin).reveal();
      assert(await mrc.tokenURI(1) === "https://apinft.racksmafia.com/api/1.json");
    })

    it("Mint multiple NFTs", async () => {
      const { admin, user, mrc } = await deployNFTFixture();
      await mrc.addAdmin(admin.address);
      await mrc.connect(admin).addToWhitelist(user.address);
      await mrc.connect(admin).flipPause();
      await mrc.connect(user).mint(4, {value: ethers.utils.parseEther("0.004")});
      await mrc.connect(user).mint(4, {value: ethers.utils.parseEther("0.004")});
      assert(await mrc.ownerOf(2) === user.address);
      assert(await mrc.ownerOf(4) === user.address);
    }) 

    it("Revert to onlyAdmin roles", async () => {
      const { mrc, user, admin } = await deployNFTFixture();
      await expect(mrc.connect(admin).addToWhitelist(user.address)).to.be.reverted;
    })

    it("Withdraw", async () => {
      const { mrc, user, admin, owner } = await deployNFTFixture();
      await mrc.addAdmin(admin.address);
      await mrc.connect(admin).addToWhitelist(user.address);
      await mrc.connect(admin).flipPause();
      await mrc.connect(user).mint(3, {value: ethers.utils.parseEther("0.003")});
      assert(await mrc.ownerOf(3) === user.address);
      
      const AMOUNT = ethers.utils.parseEther("0.002")
      assert(await mrc.connect(owner).withdraw( AMOUNT ));
      await expect(mrc.connect(owner).withdraw( AMOUNT )).to.be.reverted;
    })
  })

});