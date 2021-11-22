//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Will {
    // string private greeting;
    string private username;
    string private ethereumKey;

    constructor(string memory _username) {
        console.log("Deploying a Greeter with greeting:", _greeting);
        username = _username;
    }

    function getUserName() public view returns (string memory) {
        return username;
    }

    function setUserName(string _username) public {
        console.log("Username changed from '%s' to '%s'", this.username, _username);
        username = _username;
    }

    function setEthereumKey(string _ethereumKey) public {
        ethereumKey = _ethereumKey;
    }
}
