import { ethers } from "hardhat";
import fs  from "fs";

async function main() {

  const MRCRYPTO = await ethers.getContractFactory("MRCRYPTO");
  const mrc = await MRCRYPTO.deploy("MRCRYPTO", "MRC");

  await mrc.deployed();
  await mrc.reveal();
  await mrc.flipPause();
  await mrc.mint(1, {value: ethers.utils.parseEther("0.001")})
  console.log(await mrc.tokenURI(1));
  console.log(mrc.address);

  const constants = {
    address: mrc.address,
    abi: mrc.interface.format(ethers.utils.FormatTypes.json)
  }

  fs.writeFileSync(
    "../mrcrypto-fronted/constants/constant.json",
    JSON.stringify(constants)
  );
  console.log("Written constants");
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
