import { useState, useRef } from "react";
import { ethers } from "ethers";
import Will from "./artifacts/contracts/Will.sol/Will.json";
import Verifier from "./artifacts/contracts/Verify.sol/Verifier.json";
import "./App.css";
import { encrypt } from "eth-sig-util";
import { bufferToHex } from "ethereumjs-util";

function WillCreation() {
  const userAccount = useRef("");
  // key pair for signature
  const userEncKeyPair = useRef({
    pub: "", 
    prv: ""
  }); // Key for encrypt/decrypt message
  const [message, setMessage] = useState("");

  const successors = useRef([]);
  const successorInput = useRef("");
  
  // const willAddress = "0x072E617a6d98C7f24162E9993fBc91Ef1FeD6322"; // for ropsten testnet
  const willAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // for localhost
  const verifierAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const addSuccessors = () => {
    successors.current.push(successorInput.current);
  }

  const removeSuccessors = () => {
    if (successors.current.length <= 0) return;
    successors.current.splice(0, successors.current.length);
  }

  const requestAccount = async () => {
    // connect to Metamask wallet of user when we need to create a transaction
    const [account] = await window.ethereum.request({
      method: "eth_requestAccounts",
    }); // request Metamask account info from user
    userAccount.current = account;
    console.log("User Account:", userAccount.current);
  };
  
  const submitWill = async () => {
    if (!message) return;
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const newWill = new ethers.Contract(willAddress, Will.abi, signer);
      const verifier = new ethers.Contract(verifierAddress, Verifier.abi, signer);
      if (!userAccount.current) {
        await requestAccount();
        const setAccount = await newWill.setAccount(userAccount.current);
        await setAccount.wait();
      }
      if (!userEncKeyPair.current.pub) {
        // Set Encryption public key
        userEncKeyPair.current.pub = await window.ethereum.request({
          method: 'eth_getEncryptionPublicKey',
          params: [userAccount.current]
        });
      }
      
      // const hex_msg = `0x${Buffer.from(message, 'utf-8').toString('hex')}`;
      let msg_enc = "";
      let msg_sig = "";
      let msg_hash = "";
      try {
        // get the message signature
        
        // Encrypt the message
        msg_enc = bufferToHex(
          Buffer.from(
            JSON.stringify(
              encrypt(
                userEncKeyPair.current.pub, 
                { data: message }, 
                'x25519-xsalsa20-poly1305'
              )
            )
            ,'utf-8'
          )
        )
        msg_hash = await verifier.getMessageHash(msg_enc);
        msg_sig = await window.ethereum.request({
          method: "personal_sign",
          params: [msg_hash, userAccount.current]
        })
        console.log("Message Signature:", msg_sig)
      } catch (err) {
        console.error(err);
      }
      // Initialize & upload public key for signature to smart contract
      const setAll = await newWill.setAllFields(msg_enc, msg_sig, successors.current);
      console.log("Submitting Will...");
      await setAll.wait();
      alert("Will submitted");

      // Verification, testing purpose
      await getSuccessors();
      const msg_signature = await getSignature();
      const msg = await getMessage();
      // Decrypt message with DMS??? 
      try {
        const msg_dec = await window.ethereum.request({
          method: 'eth_decrypt', 
          params: [msg, userAccount.current]
        })
        console.log(`Original Message: ${msg_dec}`); 
        // split signature
        const r = msg_signature.slice(0, 66); // first 32 bytes of signature
        const s = "0x" + msg_signature.slice(66, 130); // second 32 bytes of signature
        // r, s are output of ECDSA signature
        const v = parseInt(msg_signature.slice(130, 132), 16); // last 1 byte (in int)
        // v is recovery ID, to recover the public key of signer
        const msg_verified = await verifier.VerifyMessage(userAccount.current, msg, v, r, s);
        alert(`Message verified: ${msg_verified}`);
      } catch (err) {
        console.error(err);
      }
    }
    else alert("Please install Metamask")
  };

  const getMessage = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum); // to access blockchain data
      const will = new ethers.Contract(willAddress, Will.abi, provider); // new instance of contract
      try {
        const data = await will.getMessage();
        console.log("Message (Encrypted): ", data);
        return data;
      } catch (error) {
        console.log(error);
      }
    }
  };

  // const getPubKeySig = async () => {
  //   if (typeof window.ethereum !== "undefined") {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum); // to access blockchain data
  //     const will = new ethers.Contract(willAddress, Will.abi, provider); // new instance of contract
  //     try {
  //       const data = await will.getPubKeySig();
  //       console.log("Public key for Signature: ", data);
  //       // return data;
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // };

  const getSignature = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum); // to access blockchain data
      const will = new ethers.Contract(willAddress, Will.abi, provider); // new instance of contract
      try {
        const data = await will.getSignature();
        console.log("Signature for message: ", data);
        return data;
      } catch (error) {
        console.log(error);
      }
    }
  }

  const getSuccessors = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum); // to access blockchain data
      const will = new ethers.Contract(willAddress, Will.abi, provider); // new instance of contract
      try {
        const data = await will.getSuccessors();
        console.log("List of Successors: ", data);
        return data;
      } catch (error) {
        console.log(error);
      }
    }
  }

  // const generateEncKeyPair = async () => {
  //   // for encrypting message of will before uploading
  //   if (userEncKeyPair.current.pub && userEncKeyPair.current.prv) {
  //     console.log("Key pair already generated. ")
  //     return;
  //   }
  //   console.log("Encryption key pair generating...")
  //   const keypair = KEYUTIL.generateKeypair("RSA", 2048);
  //   userEncKeyPair.current.pub = KEYUTIL.getKey(keypair.pubKeyObj);
  //   userEncKeyPair.current.prv = KEYUTIL.getKey(keypair.prvKeyObj);
  //   console.log("RSA key pair: ", keypair)
  //   alert("Encryption Key pair generated. Please keep the private key confidential. ");
  // }

  // const generateSigKeyPair = () => {
  //   console.log("Signature key pair generating...")
  //   if (userSigKeyPair.current.pub && userSigKeyPair.current.prv) {
  //     console.log("Public key: " + userSigKeyPair.current.pub.pubKeyHex);
  //     console.log("Private key: " + userSigKeyPair.current.prv.prvKeyHex);
  //     return;
  //   }

  //   const keypair = KEYUTIL.generateKeypair("EC", "secp256r1");
  //   userSigKeyPair.current.pub = KEYUTIL.getKey(keypair.pubKeyObj);
  //   userSigKeyPair.current.prv = KEYUTIL.getKey(keypair.prvKeyObj);
    
  //   console.log("Public key: " + userSigKeyPair.current.pub.pubKeyHex);
  //   console.log("Private key: " + userSigKeyPair.current.prv.prvKeyHex);
  //   alert("Signature Key pair generated. Please keep the private key confidential. ");
  // };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Online Will System</h1>
        <h3>Your Message for Beloved:</h3>
        <input
          style={{
            height: "20px",
            width: "300px",
          }}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Place Your Message Here"
          required={true}
          value={message}
        ></input>
        <input
          style={{
            height: "20px",
            width: "300px",
          }}
          onChange={(e) => successorInput.current = e.target.value}
          placeholder="Enter Successors"
          required={true}
          // value={successorInput.current}
        ></input>
        <button
          style={{
            marginTop: "2em",
            padding: "1px",
            margin: "8px",
            height: "50px",
            width: "200px",
            fontSize: "20px",
            alignItems: "center",
          }}
          onClick={addSuccessors}
        >
          Add Successor
        </button>
        <button
          style={{
            marginTop: "2em",
            padding: "1px",
            margin: "8px",
            height: "50px",
            width: "200px",
            fontSize: "16px",
            alignItems: "center",
          }}
          onClick={removeSuccessors}
        >
          Remove All Successors
        </button>
        <button
          style={{
            // marginTop: "2em",
            height: "50px",
            width: "100px",
            fontSize: "20px",
          }}
          onClick={submitWill}
        >
          Confirm
        </button>
        <button
          style={{
            padding: "1px",
            margin: "8px",
            height: "50px",
            width: "200px",
            fontSize: "20px",
            alignItems: "center",
          }}
          onClick={getMessage}
        >
          See Your Message
        </button>
        {/* <button
          style={{
            padding: "1px",
            // margin: "8px",
            height: "50px",
            width: "280px",
            fontSize: "20px",
            alignItems: "center",
          }}
          onClick={generateSigKeyPair}
        >
          Generate Signature Key Pair
        </button> */}
        {/* <button
          style={{
            padding: "1px",
            margin: "8px",
            height: "50px",
            width: "280px",
            fontSize: "20px",
            alignItems: "center",
          }}
          onClick={generateEncKeyPair}
        >
          Generate Encryption Key Pair
        </button> */}
      </header>
    </div>
  );
}
export default WillCreation;
