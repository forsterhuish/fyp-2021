//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

import "hardhat/console.sol";

contract Will {
    // string private greeting;
    string private username;
    string private ethereumKey;
    string private message;

    constructor(string memory _username) {
        username = _username;
        console.log("Deployed a contract");
    }

    function getUserName() public view returns (string memory) {
        return username;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }

    function setUserName(string memory _username) public {
        console.log("Username changed from '%s' to '%s'", username, _username);
        username = _username;
    }

    function setEthereumPrivKey(string memory _ethereumKey) public {
        ethereumKey = _ethereumKey;
    }

    function setMessage(string memory _message) public {
        console.log("Messsage changed from '%s' to '%s'", message, _message);
        message = _message;
    }
}
