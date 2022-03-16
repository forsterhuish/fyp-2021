// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "hardhat/console.sol";

contract Will {
    // states
    string private userAccount;
    string private pubKeySig = ""; // pub key for signature
    string private message = "";
    string private signature = ""; // msg signature
    string[] private successors;

    // function getUserAccount() public view returns (string memory) {
    //     return userAccount;
    // }

    function getMessage() public view returns (string memory) {
        return message;
    }

    function getPubKeySig() public view returns (string memory) {
        return pubKeySig;
    }

    function getSuccessors() public view returns (string[] memory) {
        return successors;
    }

    function getSignature() public view returns (string memory) {
        return signature;
    }

    function setAccount(string memory _account) public {
        console.log("User Account changed from '%s' to '%s'", userAccount, _account);
        userAccount = _account;
    }

    function setMessage(string memory _message) public {
        console.log("Messsage changed from '%s' to '%s'", message, _message);
        message = _message;
    }

    function setPubKeySig(string memory _pubKeySig) public {
        console.log("Key changed from '%s' to '%s'", pubKeySig, _pubKeySig);
        pubKeySig = _pubKeySig;
    }

    function setSignature(string memory _signature) public {
        signature = _signature;
        console.log("Signature Set");
    }

    function setSuccessors(string[] memory _successors) public {
        for (uint i = 0; i < _successors.length; i++) {
            successors.push(_successors[i]);
        }
    }

}
