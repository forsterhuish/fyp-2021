// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  await hre.run('compile');

  const [deployer] = await hre.ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  // We get the contract to deploy
  const Will = await hre.ethers.getContractFactory("Will");
  const will = await Will.deploy(); // No account specified during deployment

  await will.deployed();

  console.log("Will deployed to: ", will.address);

  const Verifier = await hre.ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy();

  await verifier.deployed();

  console.log("Verifier deployed to: ", verifier.address);

  const DMS = await hre.ethers.getContractFactory("DMS");
  const dms = await DMS.deploy();

  await dms.deployed();

  console.log("DMS deployed to: ", dms.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
