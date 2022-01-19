import { useState, useRef } from "react";
import { ethers, Wallet } from "ethers";
import Will from "./artifacts/contracts/Will.sol/Will.json";
import "./App.css";
import { KEYUTIL, KJUR } from "jsrsasign";
import { encrypt } from "eth-sig-util";
import { bufferToHex } from "ethereumjs-util";

function WillCreation() {
  const userAccount = useRef("");
  // key pair for signature
  const userSigKeyPair = useRef({
    pub: "", // public key
    prv: "", // private key, encrypted
  });
  const userEncKeyPair = useRef({
    pub: "", 
    prv: ""
  }); // Key for encrypt/decrypt message
  const [message, setMessage] = useState("");

  const successors = useRef([]);
  const successorInput = useRef("");
  
  // const willAddress = "0x072E617a6d98C7f24162E9993fBc91Ef1FeD6322"; // for ropsten testnet
  const willAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // for locahost

  const addSuccessors = () => {
    successors.current.push(successorInput.current);
    console.log("Current Successors: ", successors.current);
  }

  const removeSuccessors = () => {
    if (successors.current.length <= 0) return;
    successors.current.splice(0, successors.current.length);
    console.log("Current Successors: ", successors.current);
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
    if (!userSigKeyPair.current.pub || !userSigKeyPair.current.prv) {
      generateSigKeyPair();
    }
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      userEncKeyPair.current.pub = await window.ethereum.request({
        method: 'eth_getEncryptionPublicKey',
        params: [userAccount.current]
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const newWill = new ethers.Contract(willAddress, Will.abi, signer);
      
      // Set all fields
      // Sign the message digest using SHA512 with ECDSA
      // const ec = new KJUR.crypto.Signature({ "alg": "SHA512withECDSA" })
      // ec.init(userSigKeyPair.current.prv);
      // ec.updateString(message);
      // let msg_sig = ec.sign();

      // let accountPrivKey = prompt("Please enter your wallet private key");
      let accountPrivKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      let wallet = new Wallet(accountPrivKey);

      let msg_sig = await wallet.signMessage(message);
      console.log("Message Signature:", msg_sig)

      // Encrypt the message
      let msg_enc = bufferToHex(
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
      // Initialize & upload public key for signature to smart contract
      // if (userEncKeyPair.current.pub && userEncKeyPair.current.prv) {
      //   const setKey = await newWill.setPubKeySig(userSigKeyPair.current.pub.pubKeyHex);
      //   await setKey.wait();
      // }
      const setAcc = await newWill.setAccount(userAccount);
      const setMsg = await newWill.setMessage(msg_enc);
      const setSig = await newWill.setSignature(msg_sig);
      const setSuc = await newWill.setSuccessors(successors.current);
      console.log("Submitting Will...");
      await setAcc.wait();
      await setMsg.wait();
      await setSig.wait();
      await setSuc.wait();
      console.log("Will submitted");
      getSuccessors();
      getPubKeySig();
      getSignature();
      const msg = await getMessage();
      
      // test only
      // Decrypt message with DMS??? 
      const msg_dec = await window.ethereum.request({
        method: 'eth_decrypt', 
        params: [msg, userAccount.current]
      })
      console.log(`Original Message: ${msg_dec}`); 
    }
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

  const getPubKeySig = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum); // to access blockchain data
      const will = new ethers.Contract(willAddress, Will.abi, provider); // new instance of contract
      try {
        const data = await will.getPubKeySig();
        console.log("Public key for Signature: ", data);
        // return data;
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getSignature = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum); // to access blockchain data
      const will = new ethers.Contract(willAddress, Will.abi, provider); // new instance of contract
      try {
        const data = await will.getSignature();
        console.log("Signature for message: ", data);
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

  const generateSigKeyPair = () => {
    console.log("Signature key pair generating...")
    if (userSigKeyPair.current.pub && userSigKeyPair.current.prv) {
      console.log("Public key: " + userSigKeyPair.current.pub.pubKeyHex);
      console.log("Private key: " + userSigKeyPair.current.prv.prvKeyHex);
      return;
    }

    const keypair = KEYUTIL.generateKeypair("EC", "secp256r1");
    userSigKeyPair.current.pub = KEYUTIL.getKey(keypair.pubKeyObj);
    userSigKeyPair.current.prv = KEYUTIL.getKey(keypair.prvKeyObj);
    
    console.log("Public key: " + userSigKeyPair.current.pub.pubKeyHex);
    console.log("Private key: " + userSigKeyPair.current.prv.prvKeyHex);
    alert("Signature Key pair generated. Please keep the private key confidential. ");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Online Will System</h1>
        <h3>Your Message for Beloved:</h3>
        {/* <input
          onChange={(e) => setUserName(e.target.value)}
          placeholder="User Name"
          required={true}
          value={userName}
        ></input> */}
        {/* <input
          onChange={(e) => setEthereumPrivKey(e.target.value)}
          placeholder="Ethereum Priv Key"
          required={true}
          value={ethereumPrivKey}
        ></input> */}
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
