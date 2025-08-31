# Smart Contract Deployment Guide

## Quick Start

To enable live staking functionality, you need to deploy the SimpleStaking contract to Avalanche network.

## Prerequisites

1. **Node.js and npm** installed
2. **MetaMask** wallet with AVAX for gas fees
3. **Private key** for deployment account

## Step 1: Install Dependencies

```bash
# Install Hardhat and dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install dotenv
```

## Step 2: Configure Environment

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your values:
```
PRIVATE_KEY=your_wallet_private_key_without_0x
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
SNOWTRACE_API_KEY=your_snowtrace_api_key
```

## Step 3: Deploy Contract

### For Avalanche Fuji Testnet (Recommended for testing):
```bash
npx hardhat run scripts/deploy.js --network fuji
```

### For Avalanche Mainnet (Production):
```bash
npx hardhat run scripts/deploy.js --network avalanche
```

## Step 4: Update Frontend

After deployment, update the contract address in:
```javascript
// src/components/staking/StakingModal.tsx
const STAKING_CONTRACT_ADDRESS = ethers.utils.getAddress("YOUR_DEPLOYED_ADDRESS");
```

## Step 5: Test the Integration

1. Start your Next.js app: `npm run dev`
2. Navigate to Yield Strategies page
3. Click "Start Enhanced Strategy" on any protocol
4. Connect your wallet and test staking functionality

## Network Configuration

### Avalanche Fuji Testnet
- **Chain ID**: 43113
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Block Explorer**: https://testnet.snowtrace.io/
- **Faucet**: https://faucet.avax.network/

### Avalanche Mainnet
- **Chain ID**: 43114
- **RPC URL**: https://api.avax.network/ext/bc/C/rpc
- **Block Explorer**: https://snowtrace.io/

## Contract Details

- **Reward Rate**: 5% annual
- **Minimum Stake**: No minimum (but consider gas costs)
- **Withdrawal**: Available anytime
- **Rewards**: Auto-compounding, claimable anytime

## Security Notes

- Never commit private keys to git
- Use environment variables for sensitive data
- Test on Fuji testnet before mainnet deployment
- Consider getting a security audit for production use

## Troubleshooting

### "Contract not deployed" errors
- Check that you're using the correct deployed address
- Verify you're connected to the right network
- Ensure contract deployment was successful

### Transaction failures
- Check AVAX balance for gas fees
- Verify network connection
- Check contract has sufficient AVAX for rewards