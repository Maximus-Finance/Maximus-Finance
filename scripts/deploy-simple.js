const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "AVAX");
  console.log("Network:", await ethers.provider.getNetwork());

  console.log("\n=== Starting Simple Contract Deployment ===\n");

  console.log("1. Deploying LiveDataProvider...");
  const LiveDataProvider = await ethers.getContractFactory("LiveDataProvider");
  const dataProvider = await LiveDataProvider.deploy();
  await dataProvider.deployed();
  
  console.log("✅ LiveDataProvider deployed to:", dataProvider.address);
  console.log("   Transaction hash:", dataProvider.deployTransaction.hash);

  console.log("\n2. Deploying LiveAPYCalculator...");
  const LiveAPYCalculator = await ethers.getContractFactory("LiveAPYCalculator");
  const calculator = await LiveAPYCalculator.deploy(dataProvider.address);
  await calculator.deployed();
  
  console.log("✅ LiveAPYCalculator deployed to:", calculator.address);
  console.log("   Transaction hash:", calculator.deployTransaction.hash);

  console.log("\n3. Deploying YieldOptimizationFactory...");
  const YieldOptimizationFactory = await ethers.getContractFactory("YieldOptimizationFactory");
  const factory = await YieldOptimizationFactory.deploy();
  await factory.deployed();
  
  console.log("✅ YieldOptimizationFactory deployed to:", factory.address);
  console.log("   Transaction hash:", factory.deployTransaction.hash);

  console.log("\n4. Testing basic contract functionality...");
  
  try {
    const stakingAPY = await dataProvider.getSAvaxStakingAPY();
    console.log("📊 sAVAX Staking APY:", stakingAPY.toString(), "basis points");
    
    const testAmount = ethers.utils.parseEther("100");
    try {
      const result = await calculator.calculateLoopingStrategy(testAmount, 4, 6000);
      console.log("🧮 Strategy calculation for 100 AVAX (Conservative):");
      console.log("   Total Supplied:", ethers.utils.formatEther(result.totalSupplied), "AVAX");
      console.log("   Total Borrowed:", ethers.utils.formatEther(result.totalBorrowed), "AVAX");
      console.log("   Leverage:", result.leverage.toString(), "basis points");
      console.log("   Net APY:", result.netAPY.toString(), "basis points");
    } catch (error) {
      console.log("⚠️  Calculator testing failed (expected on testnet):", error.reason || error.message);
    }
    
  } catch (error) {
    console.log("⚠️  Basic testing failed:", error.reason || error.message);
  }

  console.log("\n🎉 === DEPLOYMENT COMPLETE ===");
  console.log("Deployment Summary:");
  console.log("==================");
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("LiveDataProvider:", dataProvider.address);
  console.log("LiveAPYCalculator:", calculator.address);
  console.log("YieldOptimizationFactory:", factory.address);

  console.log("\n📋 Contract Structure and Functionality:");
  console.log("========================================");
  console.log("1. LiveDataProvider: Fetches live market data from BENQI");
  console.log("   - getSAvaxMarketData(): Gets supply/borrow rates and rewards");
  console.log("   - getSAvaxStakingAPY(): Gets sAVAX liquid staking rewards");
  console.log("   - getOptimalParameters(): Calculates optimal strategy params");
  
  console.log("\n2. LiveAPYCalculator: Simulates yield strategies");
  console.log("   - calculateLoopingStrategy(): Simulates looping with given params");
  console.log("   - getOptimalStrategy(): Finds best parameters for max APY");
  console.log("   - simulateScenarios(): Tests conservative/balanced/aggressive");
  
  console.log("\n3. YieldOptimizationFactory: Creates and manages vaults");
  console.log("   - createVault(): Deploys new YieldOptimizationVault");
  console.log("   - getAllVaults(): Lists all created vaults");
  console.log("   - updateAllVaultMetrics(): Updates TVL and APY data");

  console.log("\n⚠️  Note: Full functionality requires BENQI contracts on mainnet");
  console.log("   Testnet deployment allows testing contract structure only");

  return {
    dataProvider: dataProvider.address,
    calculator: calculator.address,
    factory: factory.address,
    network: await ethers.provider.getNetwork()
  };
}

async function deploy() {
  try {
    return await main();
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
    throw error;
  }
}

if (require.main === module) {
  deploy()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { deploy };