import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func = async function (hre) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  await deploy('Will', {
    from: deployer,
    args: ['Medium', 'MDM'],
    log: true,
  });
};

export default func;
func.tags = ['Will'];