//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

import "hardhat/console.sol";

contract Will {
    // string private greeting;
    string private userAccount;
    string private ethereumKey;
    string private message;

    constructor(string memory _userAccount) {
        userAccount = _userAccount;
        console.log("Deployed a contract");
    }

    function getUserAccount() public view returns (string memory) {
        return userAccount;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }

    // function setUserName(string memory _userAccount) public {
    //     console.log("Username changed from '%s' to '%s'", userAccount, _userAccount);
    //     userAccount = _userAccount;
    // }

    // function setEthereumPrivKey(string memory _ethereumKey) public {
    //     ethereumKey = _ethereumKey;
    // }

    function setAccount(string memory _account) public {
        console.log("User Account changed from '%s' to '%s'", userAccount, _account);
        userAccount = _account;
    }

    function setMessage(string memory _message) public {
        console.log("Messsage changed from '%s' to '%s'", message, _message);
        message = _message;
    }
}
