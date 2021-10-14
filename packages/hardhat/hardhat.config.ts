import 'dotenv/config'
import { HardhatUserConfig } from 'hardhat/config'
import 'hardhat-deploy'
import 'hardhat-watcher'
import '@typechain/hardhat'
import '@nomiclabs/hardhat-waffle'
import '@atixlabs/hardhat-time-n-mine'
import 'hardhat-gas-reporter'
import 'solidity-coverage'

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: '0.8.4',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    defaultNetwork: 'localhost',
    networks: {
        localhost: {
            url: 'http://localhost:8545',
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    gasReporter: {
        currency: 'ETH',
        gasPrice: 1,
        enabled: process.env.REPORT_GAS ? true : false,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        maxMethodDiff: 10,
    },
    typechain: {
        target: 'ethers-v5',
    },
    mocha: {
        timeout: 0,
    },
    watcher: {
        test: {
            tasks: ['test'],
            files: ['./test/**/*'],
            verbose: true
        }
    }
}

export default config
