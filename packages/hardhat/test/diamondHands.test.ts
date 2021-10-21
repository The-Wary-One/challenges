import '@atixlabs/hardhat-time-n-mine/dist/src/type-extensions'
import { expect } from 'chai'
import { deployments } from 'hardhat'

import { DiamondHands } from '../typechain'

const setupTests = deployments.createFixture(async (hre) => {
    await hre.deployments.fixture('DiamondHands')
    const [user1] = await hre.ethers.getUnnamedSigners()
    const diamondHands = await hre.ethers.getContract<DiamondHands>('DiamondHands', user1)
    return {
        hre,
        user1,
        diamondHands,
    }
})

const TWO_YEARS_IN_SECONDS = 2 * 365 * 24 * 60 * 60

describe('DiamondHands', () => {
    describe('deposit', () => {
        it('should revert if 0 ETH was send', async () => {
            const { diamondHands } = await setupTests()
            await expect(diamondHands.deposit({ value: 0 })).to.be.revertedWith('Insufficient funds')
        })

        it("should add the received amount to the user's balance and reset the locking period", async () => {
            // Prepare
            const { hre, user1, diamondHands } = await setupTests()
            const oneEther = hre.ethers.constants.WeiPerEther
            // act
            let tx = await diamondHands.deposit({ value: oneEther })
            let receipt = await tx.wait()
            // check
            let block = await hre.ethers.provider.getBlock(receipt.blockNumber)
            expect(tx).to.changeEtherBalance(user1, oneEther.mul(-1))
            expect(await hre.ethers.provider.getBalance(diamondHands.address)).to.equal(oneEther)
            expect(await diamondHands.balanceOf(user1.address)).to.equal(oneEther)
            expect(await diamondHands.lockedUntil(user1.address)).to.equal(block.timestamp + TWO_YEARS_IN_SECONDS)

            // act
            tx = await diamondHands.deposit({ value: oneEther })
            receipt = await tx.wait()
            // check
            block = await hre.ethers.provider.getBlock(receipt.blockNumber)
            expect(await diamondHands.balanceOf(user1.address)).to.equal(oneEther.mul(2))
            expect(await diamondHands.lockedUntil(user1.address)).to.equal(block.timestamp + TWO_YEARS_IN_SECONDS)
        })
    })

    describe('withdraw', () => {
        it('should revert when the user never deposited', async () => {
            const { diamondHands } = await setupTests()
            await expect(diamondHands.withdraw()).to.be.revertedWith('Cannot withdraw')
        })

        it('should revert when the funds are still locked', async () => {
            const { hre, diamondHands } = await setupTests()
            const oneEther = hre.ethers.constants.WeiPerEther
            await diamondHands.deposit({ value: oneEther })
            await expect(diamondHands.withdraw()).to.be.revertedWith('Cannot withdraw')
            await hre.timeAndMine.setTimeIncrease(`${TWO_YEARS_IN_SECONDS - 2}`)
            await expect(diamondHands.withdraw()).to.be.revertedWith('Cannot withdraw')
        })

        it('should withdraw once the funds after the locking period', async () => {
            const { hre, user1, diamondHands } = await setupTests()
            const oneEther = hre.ethers.constants.WeiPerEther
            await diamondHands.deposit({ value: oneEther })
            await hre.timeAndMine.setTimeIncrease(TWO_YEARS_IN_SECONDS.toString())
            await expect(await diamondHands.withdraw()).to.changeEtherBalance(user1, oneEther)
            await expect(diamondHands.withdraw()).to.be.revertedWith('Cannot withdraw')
        })
    })
})