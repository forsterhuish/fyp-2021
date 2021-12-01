import { useState, useRef } from "react";
import { ethers } from "ethers";
import Will from "./artifacts/contracts/Will.sol/Will.json";
import "./App.css";
import { hextoArrayBuffer, hextob64, hextorstr, KEYUTIL, KJUR } from "jsrsasign";
// import CryptoJS from "crypto-js";
// const forge = require("node-forge"); 
require("jsrsasign");

function WillCreation() {
  const userAccount = useRef("");
  // key pair for signature
  const userSigKeyPair = useRef({
    pub: "", // public key
    prv: "", // private key, encrypted
  });
  // const userKeyStoring = useRef(""); // Key for encrypt/decrypt private key of ECDSA
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
    // setSuccessors(prev => [...prev, successorInput.current]);
    successors.current.push(successorInput.current);
    console.log(successors.current);
  }

  const requestAccount = async () => {
    // connect to Metamask wallet of user when we need to create a transaction
    const [account] = await window.ethereum.request({
      method: "eth_requestAccounts",
    }); // request Metamask account info from user
    // setUserAccount(account);
    userAccount.current = account;
    console.log("User Account:", userAccount.current);
  };

  const submitWill = async () => {
    if (!message) return;
    if (!userSigKeyPair.current.pub || !userSigKeyPair.current.prv) {
      console.log("Please get a signature key pair first. ")
      return;
    }
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const newWill = new ethers.Contract(willAddress, Will.abi, signer);
      
      // Set all fields
      // Sign the message digest using SHA512 with ECDSA
      const ec = new KJUR.crypto.Signature({ "alg": "SHA512withECDSA" })
      // Retrieve 'real' private key - not yet implemented
      // let iv_key = CryptoJS.enc.Hex.parse("1155125110ffffff")
      // let priv_key_sig = CryptoJS.AES.decrypt(userSigKeyPair.current.prv, userKeyStoring.current, { iv: iv_key });
      // priv_key_sig = CryptoJS.enc.Hex.stringify(priv_key_sig);
      // let iv_key = forge.util.createBuffer(forge.util.hexToBytes("1155125110ffffff1155125110ffffff"), 'raw');
      // let aes_decrypt = forge.cipher.createDecipher("AES-CTR", userKeyStoring.current);
      // aes_decrypt.start({ iv: iv_key });
      // aes_decrypt.update(forge.util.hexToBytes(userSigKeyPair.current.prv))
      // if (aes_decrypt.finish())
      //   priv_key_sig = aes_decrypt.output.toHex();
      ec.init(userSigKeyPair.current.prv);
      ec.updateString(message);
      let msg_sig = ec.sign();

      if (!userEncKeyPair.current.pub || !userEncKeyPair.current.prv) {
        console.log("Initialize key")
        generateEncKeyPair();
        const setKey = await newWill.setPubKeySig(userSigKeyPair.current.pub);
        await setKey.wait();
      }
      // let iv_msg = CryptoJS.enc.Utf8.parse("1155125110ffffff1155125110ffffff")
      // let msg_enc = CryptoJS.AES.encrypt(message, userKeyEncrypt.current, { iv: iv_msg });
      let msg_enc = KJUR.crypto.Cipher.encrypt(message, userEncKeyPair.current.pub);
      // Initialize & upload public key for signature to smart contract
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
      const msg = await getMessage();
      getSuccessors();

      // test only
      const ori_message = KJUR.crypto.Cipher.decrypt(msg, userEncKeyPair.current.prv);
      console.log("Original Message: ", ori_message); 
    }
  };

  const getMessage = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum); // to access blockchain data
      const will = new ethers.Contract(willAddress, Will.abi, provider); // new instance of contract
      try {
        const data = await will.getMessage(); // greeting value
        console.log("Message: ", data);
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
        const data = await will.getPubKeySig(); // greeting value
        // console.log("Public key: ", data);
        return data;
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getSuccessors = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum); // to access blockchain data
      const will = new ethers.Contract(willAddress, Will.abi, provider); // new instance of contract
      try {
        const data = await will.getSuccessors(); // greeting value
        console.log("List of Successors: ", data);
      } catch (error) {
        console.log(error);
      }
    }
  }

  // const generateKeyPBKDF = () => {
  //   // Use PBKDF2 to generate AES key
  //   // Then use AES to encrypt private key
  //   if (userKeyStoring.current) return;
  //   const salt = CryptoJS.lib.WordArray.random(128 / 8);
  //   const key = CryptoJS.PBKDF2("fyp2021", salt, {
  //     keySize: 256 / 32
  //   });
  //   // const salt = forge.random.getBytesSync(128);
  //   // const key = forge.pkcs5.pbkdf2("fyp2021", salt, 10000, 32);
  //   userKeyStoring.current = key;
  // }

  const generateEncKeyPair = () => {
    // for encrypting message of will before uploading
    if (userEncKeyPair.current.pub && userEncKeyPair.current.prv) {
      console.log("Public key RSA: " + hextob64(userEncKeyPair.current.pub));
      console.log("Private key RSA: " + hextob64(userEncKeyPair.current.prv));
      return;
    }
    const keypair = KEYUTIL.generateKeypair("RSA", 2048);
    userEncKeyPair.current.pub = KEYUTIL.getKey(keypair.pubKeyObj);
    userEncKeyPair.current.prv = KEYUTIL.getKey(keypair.prvKeyObj);
    console.log("Public key RSA: " + hextob64(userEncKeyPair.current.pub));
    console.log("Private key RSA: " + hextob64(userEncKeyPair.current.prv));
    // const salt = CryptoJS.lib.WordArray.random(128 / 8);
    // const key = CryptoJS.PBKDF2("fyp2021enc", salt, {
    //   keySize: 256 / 32, 
    //   iterations: 1000
    // });
    // const salt = forge.random.getBytesSync(128);
    // const key = forge.pkcs5.pbkdf2("fyp2021enc", salt, 10000, 32);
  }

  const generateSigKeyPair = () => {
    if (userSigKeyPair.current.pub && userSigKeyPair.current.prv) {
      console.log("Public key: " + hextob64(userSigKeyPair.current.pub));
      console.log("Private key: " + hextob64(userSigKeyPair.current.prv));
      return;
    }
    // const ec = new KJUR.crypto.ECDSA({ curve: "secp256r1" });
    // const keypair = ec.generateKeyPairHex();
    // userSigKeyPair.current.pub = keypair.ecpubhex;
    // userSigKeyPair.current.prv = keypair.ecprvhex;
    const keypair = KEYUTIL.generateKeypair("EC", "secp256r1");
    userSigKeyPair.current.pub = KEYUTIL.getKey(keypair.pubKeyObj);
    userSigKeyPair.current.prv = KEYUTIL.getKey(keypair.prvKeyObj);
    // Initialize AES key for storing private key securely - not yet implemented
    // if (!userKeyStoring.current) generateKeyPBKDF();
    // let priv = CryptoJS.enc.Hex.parse(keypair.ecprvhex);
    // let iv = CryptoJS.enc.Hex.parse("1155125110ffffff");
    // const key_enc = CryptoJS.AES.encrypt(priv, userKeyStoring.current, { iv: iv });
    // userSigKeyPair.current.prv = key_enc;
    // let iv = forge.util.createBuffer(forge.util.hexToBytes("1155125110ffffff1155125110ffffff"), 'raw');
    // const aes = forge.cipher.createCipher("AES-CTR", userKeyStoring.current);
    // aes.start({iv: iv});
    // aes.update(forge.util.createBuffer(keypair.ecprvhex));
    // aes.finish()
    // userSigKeyPair.current.prv = aes.output.toHex();
    // setSigKeyPair(prev => ({
    //   ...prev, 
    //   pub: keypair.ecpubhex, 
    //   prv: keypair.ecprvhex
    // }))
    console.log("Public key: " + hextob64(userSigKeyPair.current.pub));
    console.log("Private key: " + hextob64(userSigKeyPair.current.prv));
    // alert("Public key: " + keypair.ecpubhex);
    // alert("Private key: " + keypair.ecprvhex);
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
        <button
          style={{
            padding: "1px",
            margin: "8px",
            height: "50px",
            width: "280px",
            fontSize: "20px",
            alignItems: "center",
          }}
          onClick={generateSigKeyPair}
        >
          Generate Signature Key Pair
        </button>
      </header>
    </div>
  );
}
export default WillCreation;
