//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Will {
    // string private greeting;
    string private username;
    string private ethereumKey;

    constructor(string memory _username) {
        string memory empty = " ";
        if (keccak256(bytes(_username)) == keccak256(bytes(empty))) {
            // check if it is first initialization
            console.log("Initializing...");
        }
        console.log("Deployed a contract");
        username = _username;
    }

    function getUserName() public view returns (string memory) {
        return username;
    }

    function setUserName(string memory _username) public {
        console.log("Username changed from '%s' to '%s'", username, _username);
        username = _username;
    }

    function setEthereumKey(string memory _ethereumKey) public {
        ethereumKey = _ethereumKey;
    }
}
