require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Default local network — used for npx hardhat test
    hardhat: {
      chainId: 1337
    },
    // Ganache GUI — use if you want a persistent visual blockchain
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: {
        mnemonic: "PASTE_YOUR_GANACHE_MNEMONIC_HERE"
      }
    },
    // Hardhat node — use if you run npx hardhat node in a separate terminal
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    }
  },
  // Gas reporter — shows cost of each function when you run tests
  gasReporter: {
    enabled: true,
    currency: "USD"
  },
  // Where compiled contract artifacts go (Spring Boot will read from here)
  paths: {
    sources:   "./contracts",
    tests:     "./test",
    cache:     "./cache",
    artifacts: "./artifacts"
  }
};