# Immutable Pharmacy Prescription Tracker

A full-stack decentralized application for secure medical prescription management built on Ethereum.

## Tech Stack
- **Blockchain**: Solidity 0.8.19, Hardhat, Web3j
- **Backend**: Spring Boot 3.2, Java 17, Web3j 4.10.3
- **Frontend**: React, Ethers.js, React Router

## Project Structure
```
├── pharmacy-tracker/     # Solidity smart contract + Hardhat tests
├── pharmacy-backend/     # Spring Boot REST API
└── pharmacy-frontend/    # React UI
```

## Quick Start

### 1. Start local blockchain
```bash
cd pharmacy-tracker
npm install
npx hardhat node
```

### 2. Deploy contract (new terminal)
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Configure backend
```bash
cd pharmacy-backend
cp src/main/resources/application.properties.template \
   src/main/resources/application.properties
# Edit application.properties with your contract address and private keys
```

### 4. Start backend
```bash
./mvnw spring-boot:run
```

### 5. Start frontend
```bash
cd pharmacy-frontend
npm install
npm start
```

## Security Note
Private keys and `application.properties` are excluded from version control.
Never commit real private keys. The Hardhat keys used here are publicly known
test accounts only valid on a local node.

## Smart Contract
- **Network**: Local Hardhat node (http://127.0.0.1:8545)
- **Test Coverage**: 30/30 tests passing
- **Security**: RBAC, double-spend prevention, time-lock expiry