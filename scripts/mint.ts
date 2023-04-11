import { ethers } from "hardhat";

async function main() {

  const MRCRYPTO = await ethers.getContractFactory("MRCRYPTO");
  const mrc = await MRCRYPTO.attach("0xfe73e3a016964aC3F1AeeAAfc71088D97a22a0EF");
 
  await mrc.reveal();
  await mrc.mint(1, {value: ethers.utils.parseEther("0.001")})

  console.log(await mrc.tokenURI(1));
  console.log(mrc.address);
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
