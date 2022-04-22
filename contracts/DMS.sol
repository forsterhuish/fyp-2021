// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "hardhat/console.sol";

contract DMS {
    address payable private successor;
    address payable private testator;
    uint public heartbeatPeriod;
    uint public lastHeartbeat;
    mapping (address => uint) balances;

    receive() external payable {}

    modifier only_testator() {
        assert(msg.sender == testator);
        lastHeartbeat = block.timestamp;
        _;
    }

    function initDMS(address payable _successor, address payable _testator, uint _heartbeatPeriod) public {
        successor = _successor;
        testator = _testator;
        heartbeatPeriod = _heartbeatPeriod * 1 days; // variable in seconds, argument in day
        lastHeartbeat = block.timestamp; // current time, according to time when the block is mined
    }

    function updateHeartbeat() only_testator public {
        lastHeartbeat = block.timestamp;
    }

    function send() payable public {
        payable(successor).transfer(address(this).balance);
    }
}