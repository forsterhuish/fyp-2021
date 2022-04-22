// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "hardhat/console.sol";

contract Will {
    // states
    string private userAccount;
    string private message = "";
    string private signature = ""; // msg signature
    address payable private successor;

    function getMessage() public view returns (string memory) {
        return message;
    }

    function getSuccessors() public view returns (address payable) {
        return successor;
    }

    function getSignature() public view returns (string memory) {
        return signature;
    }

    function setAccount(string memory _account) public {
        console.log("User Account changed from '%s' to '%s'", userAccount, _account);
        userAccount = _account;
    }

    function setAllFields(string memory _message, string memory _signature, address payable _successor) public {
        setMessage(_message);
        setSignature(_signature);
        setSuccessors(_successor);
    }

    function setMessage(string memory _message) public {
        console.log("Messsage changed from '%s' to '%s'", message, _message);
        message = _message;
    }

    function setSignature(string memory _signature) public {
        signature = _signature;
        console.log("Signature Set");
    }

    function setSuccessors(address payable _successor) public {
        // for (uint i = 0; i < _successors.length; i++) {
        //     successor.push(_successors[i]);a
        // }
        successor = _successor;
        console.log("Successor Set");
    }

}
