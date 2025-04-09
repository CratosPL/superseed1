const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Wdrożenie kontraktu z adresu:", deployer.address);

  const SuperseedGameScores = await hre.ethers.getContractFactory("SuperseedGameScores");
  const gameScores = await SuperseedGameScores.deploy();

  await gameScores.deployed();

  console.log("SuperseedGameScores wdrożony pod adresem:", gameScores.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});