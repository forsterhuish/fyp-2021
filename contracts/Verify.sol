// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "hardhat/console.sol";

/* Signature Verification

How to Sign and Verify
# Signing
1. Create message to sign
2. Hash the message
3. Sign the hash (off chain, keep your private key secret)

# Verify
1. Recreate hash from the original message
2. Recover signer from signature and hash
3. Compare recovered signer to claimed signer
*/

contract Verifier {
    function getMessageHash(string memory _message) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_message));
    }

    function VerifyMessage(address _signer, string memory _msg, uint8 _v, bytes32 _r, bytes32 _s) public pure returns (bool) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32"; // personal_sign
        bytes32 _hashedMessage = getMessageHash(_msg);
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix, _hashedMessage));
        address signer = ecrecover(prefixedHashMessage, _v, _r, _s);
        return _signer == signer;
    }
}
