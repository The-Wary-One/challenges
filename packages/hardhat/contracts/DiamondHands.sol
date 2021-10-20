// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.4;

contract DiamondHands {

    uint256 constant lockPeriod = 2 * 365 days; // 2 years

    struct Hand {
        uint256 balance;
        uint256 lockedTil;
    }

    mapping (address => Hand) private _hands;

    function balanceOf(address _addr) public view returns (uint256) {
        return _hands[_addr].balance;
    }

    function lockedUntil(address _addr) public view returns (uint256) {
        return _hands[_addr].lockedTil;
    }

    function deposit() external payable {
        require(msg.value > 0);
        _hands[msg.sender].balance += msg.value;
        _hands[msg.sender].lockedTil = block.timestamp + lockPeriod;
    }

    function withdraw() external {

    }
}