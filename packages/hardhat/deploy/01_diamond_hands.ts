import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre) {
    const { deployer } = await hre.getNamedAccounts()

    await hre.deployments.deploy('DiamondHands', {
        from: deployer,
        log: true,
    })
}

export default func
func.tags = ['DiamondHands']