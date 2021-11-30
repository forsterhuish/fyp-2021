import { useState, useRef } from "react";
import { ethers } from "ethers";
import Will from "./artifacts/contracts/Will.sol/Will.json";
import "./App.css";
import { KJUR } from "jsrsasign";
require("jsrsasign");

function WillCreation() {
  const userAccount = useRef("");
  const userKeyPair = useRef({
    pub: "", 
    prv: ""
  });
  // const [userName, setUserName] = useState("");
  // const [ethereumPrivKey, setEthereumPrivKey] = useState("");
  const [message, setMessage] = useState("");
  // const [successors, setSuccessors] = useState([]); // list of beneficiaries ethereum priv keys
  const willAddress = "0x072E617a6d98C7f24162E9993fBc91Ef1FeD6322";

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
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const newWill = new ethers.Contract(willAddress, Will.abi, signer);

      // Set all fields
      // const setName = await newWill.setUserName(userName);
      // const setKey = await newWill.setEthereumPrivKey(ethereumPrivKey);
      let msg_hex = message.toString(16);
      const ec = new KJUR.crypto.ECDSA({ 'curve': "secp256r1" });
      let msg_enc = ec.signHex(msg_hex, userKeyPair.current.prv);
      const setAcc = await newWill.setAccount(userAccount);
      const setMsg = await newWill.setMessage(msg_enc);
      // await setName.wait();
      // await setKey.wait();
      console.log("Submitting Will...")
      await setAcc.wait();
      await setMsg.wait();
      console.log("Will submitted");
      // getUserName();
      // getUserAccount();
      // getMessage();
    }
  };

  const getUserAccount = async () => {
    if (typeof window.ethereum !== "undefined") {
      // looking for metamask extension to be connected (installed in user's browser) - injected into window.ethereum
      const provider = new ethers.providers.Web3Provider(window.ethereum); // to access blockchain data
      const will = new ethers.Contract(willAddress, Will.abi, provider); // new instance of contract
      try {
        const data = await will.getUserAccount(); // greeting value
        console.log("User Account:", data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // const getUserName = async () => {
  //   if (typeof window.ethereum !== 'undefined') {
  //     // looking for metamask extension to be connected (installed in user's browser) - injected into window.ethereum
  //     const provider = new ethers.providers.Web3Provider(window.ethereum); // to access blockchain data
  //     const will = new ethers.Contract(willAddress, Will.abi, provider); // new instance of contract
  //     try {
  //       const data = await will.getUserName(); // greeting value
  //       console.log("User Name:", data);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  //};

  const getMessage = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum); // to access blockchain data
      const will = new ethers.Contract(willAddress, Will.abi, provider); // new instance of contract
      try {
        const data = await will.getMessage(); // greeting value
        console.log("Message: ", data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const generateKeyPair = () => {
    const ec = new KJUR.crypto.ECDSA({ 'curve': "secp256r1" });
    const keypair = ec.generateKeyPairHex();
    userKeyPair.current.pub = keypair.ecpubhex;
    userKeyPair.current.prv = keypair.ecpubhex;
    console.log("Public key: "  + keypair.ecpubhex);
    console.log("Private key: " + keypair.ecprvhex);
    // alert("Public key: " + keypair.ecpubhex);
    // alert("Private key: " + keypair.ecprvhex);
    alert("Key pair generated. Please keep the private key confidential. ");
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
        <button
          style={{
            marginTop: "2em",
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
            width: "200px",
            fontSize: "20px",
            alignItems: "center",
          }}
          onClick={generateKeyPair}
        >
          Generate Key Pair
        </button>
      </header>
    </div>
  );
}
export default WillCreation;
