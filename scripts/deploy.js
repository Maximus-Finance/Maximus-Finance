const hre = require("hardhat");

async function main() {
  console.log("Deploying SimpleStaking contract...");

  const SimpleStaking = await hre.ethers.getContractFactory("SimpleStaking");
  
  const simpleStaking = await SimpleStaking.deploy();
  
  await simpleStaking.waitForDeployment();
  
  const contractAddress = await simpleStaking.getAddress();
  console.log("SimpleStaking deployed to:", contractAddress);
  
  console.log("Waiting for block confirmations...");
  await simpleStaking.deploymentTransaction().wait(6);
  
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