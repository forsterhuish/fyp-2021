import { useState, useRef } from "react";
import { ethers } from "ethers";
import Will from "./artifacts/contracts/Will.sol/Will.json";
import Verifier from "./artifacts/contracts/Verify.sol/Verifier.json";
import DMS from "./artifacts/contracts/DMS.sol/DMS.json";
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
  const [amount, setAmount] = useState(0.0);
  const [needDms, setNeedDms] = useState(false);

  const successor = useRef("");
  const successorInput = useRef("");
  
  // const willAddress = "0x072E617a6d98C7f24162E9993fBc91Ef1FeD6322"; // for ropsten testnet
  const willAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // for localhost
  const verifierAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const dmsAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  const addSuccessors = () => {
    // if (successor.current.includes(successorInput.current)) {
    //   // console.log("already included")
    //   return;
    // }
    // successor.current.push(successorInput.current);
    if (successor.current === successorInput.current) return;
    successor.current = successorInput.current;
    console.log("Successor added\nCurrent Successor: " + successor.current);
  }

  const removeSuccessors = () => {
    if (successor.current.length <= 0) return;
    // successor.current.splice(0, successor.current.length);
    successor.current = "";
    console.log("Successor removed\nCurrent Successor: " + successor.current);
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
      const dms = new ethers.Contract(dmsAddress, DMS.abi, signer);
      if (successor.current.length <= 0) {
        alert("You have no successor");
        return;
      }
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
      const setAll = await newWill.setAllFields(msg_enc, msg_sig, successor.current/*, parseFloat(amount) * 1e16*/);
      console.log("Submitting Will...");
      await setAll.wait();
      alert("Will submitted");

      if (needDms) {
        console.log("Create DMS...");
        const initDMS = await dms.initDMS(successor.current, userAccount.current, 7);
        await initDMS.wait();
        signer.sendTransaction({
          from: userAccount.current,
          to: successor.current,
          value: ethers.utils.parseUnits(amount, "ether")
        })
        // const depositDMS = await dms.deposit(Math.round(parseFloat(amount) * 1e16));
        // await depositDMS.wait();
        alert("Create DMS Success");
      }

      // Verification, testing purpose
      await getSuccessors();
      const msg_signature = await getSignature();
      const msg = await getMessage();
      // Decrypt message with DMS??? 
      try {
        // split signature
        const r = msg_signature.slice(0, 66); // first 32 bytes of signature
        const s = "0x" + msg_signature.slice(66, 130); // second 32 bytes of signature
        // r, s are output of ECDSA signature
        const v = parseInt(msg_signature.slice(130, 132), 16); // last 1 byte (in int)
        // v is recovery ID, to recover the public key of signer
        const msg_verified = await verifier.VerifyMessage(userAccount.current, msg, v, r, s);
        if (msg_verified === true) {
          const msg_dec = await window.ethereum.request({
            method: 'eth_decrypt', 
            params: [msg, userAccount.current]
          })
          console.log(`Original Message: ${msg_dec}`);
          alert(`Original Message: ${msg_dec}`); 
          removeSuccessors();
        }
        else {
          alert("Wrong signature");
        }
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
        console.log("List of Successor: ", data);
        return data;
      } catch (error) {
        console.log(error);
      }
    }
  }

  const transferAsset = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum); // to access blockchain data
      const signer = provider.getSigner();
      const dms = new ethers.Contract(dmsAddress, DMS.abi, signer);
      try {
        await dms.send();
        console.log("Success in transfer");
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Online Will System</h1>
        <p>Place Your Message Here</p>
        <input
          style={{
            height: "50px",
            width: "300px",
            fontSize: "20px",
          }}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Place Your Message Here"
          required={true}
          value={message}
        ></input>
        <p>Enter Address(es) of successor(s)</p>
        <input
          style={{
            height: "50px",
            width: "300px",
            fontSize: "17px",
          }}
          onChange={(e) => successorInput.current = e.target.value}
          placeholder="Enter Address(es) of successor(s)"
          required={true}
          // value="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
        ></input>
        <p>How much would you like to deposit?</p>
        <input
          style={{
            height: "50px",
            width: "300px",
            fontSize: "17px",
          }}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="How much would you like to deposit?"
          required={true}
          value={amount}
        ></input>
        <p>Create DMS?</p>
        <label>
          <input type="checkbox" checked={needDms} onChange={() => setNeedDms(!needDms)}/>
          Yes
        </label>
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
          Remove All Successor
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
        <hr width="500px" />
        <h3>Will Execution</h3>
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
          onClick={transferAsset}
        >
          Transfer Assets
        </button>
      </header>
    </div>
  );
}
export default WillCreation;
