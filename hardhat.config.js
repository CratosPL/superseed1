require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    superseedSepolia: {
      url: "https://sepolia.superseed.xyz",
      chainId: 53302,
      accounts: [process.env.PRIVATE_KEY],
    },
    hardhat: {
      chainId: 1337,
    },
  },
  gasReporter: {
    enabled: true,
  },
};