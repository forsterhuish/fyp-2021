require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.12",
  paths: {
    artifacts: './src/artifacts', // set artifacts directory
  },
  networks: {
    // deploy to testnet
    hardhat: {
      chainId: 1337, 
    }, 
    ropsten: {
      url: "https://ropsten.infura.io/v3/67336007058e454e99f4a4ffa1618167", 
      accounts: ['0x075ab938a38732556259527c72a80f69b04a305f69743a6a6943746811112df5'] // 0x appended with private key we work with
    }
  },
};
