const hre = require("hardhat");

async function main() {
  console.log("Deploying SimpleStaking contract...");

  // Get the contract factory
  const SimpleStaking = await hre.ethers.getContractFactory("SimpleStaking");
  
  // Deploy the contract
  const simpleStaking = await SimpleStaking.deploy();
  
  // Wait for deployment to finish
  await simpleStaking.waitForDeployment();
  
  const contractAddress = await simpleStaking.getAddress();
  console.log("SimpleStaking deployed to:", contractAddress);
  
  // Wait for a few block confirmations before verifying
  console.log("Waiting for block confirmations...");
  await simpleStaking.deploymentTransaction().wait(6);
  
  // Verify the contract on the network
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.log("Error verifying contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });