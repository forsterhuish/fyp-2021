import { useState } from "react";
import { ethers } from "ethers";
import Will from "./artifacts/contracts/Will.sol/Will.json";
import "./App.css";

function App() {
  const [userName, setUserName] = useState("");
  const [ethereumPrivKey, setEthereumPrivKey] = useState("");
  const [message, setMessage] = useState("");
  // const [successors, setSuccessors] = useState([]); // list of beneficiaries ethereum priv keys
  const willAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const requestAccount = async () => {
    // connect to Metamask wallet of user when we need to create a transaction
    await window.ethereum.request({
      method: "eth_requestAccounts",
    }); // request Metamask account info from user
  };

  const submitWill = async () => {
    if (!userName || !ethereumPrivKey || !message) return;
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const newWill = new ethers.Contract(willAddress, Will.abi, signer);

      // Set all fields
      const setName = await newWill.setUserName(userName);
      const setKey = await newWill.setEthereumPrivKey(ethereumPrivKey);
      const setMsg = await newWill.setMessage(message);
      await setName.wait();
      await setKey.wait();
      await setMsg.wait();
      console.log("Will submitted");
      getUserName();
      getMessage();
    }
  };

  const getUserName = async () => {
    if (typeof window.ethereum !== 'undefined') {
      // looking for metamask extension to be connected (installed in user's browser) - injected into window.ethereum
      const provider = new ethers.providers.Web3Provider(window.ethereum); // to access blockchain data
      const will = new ethers.Contract(willAddress, Will.abi, provider); // new instance of contract
      try {
        const data = await will.getUserName(); // greeting value
        console.log("User Name: ", data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getMessage = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum); // to access blockchain data
      const will = new ethers.Contract(willAddress, Will.abi, provider); // new instance of contract
      try {
        const data = await will.getUserName(); // greeting value
        console.log("Message: ", data);
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Online Will System</h1>
        <h3>Please input all following fields:</h3>
        <input
          onChange={(e) => setUserName(e.target.value)}
          placeholder="User Name"
          required={true}
          value={userName}
        ></input>
        <input
          onChange={(e) => setEthereumPrivKey(e.target.value)}
          placeholder="Ethereum Priv Key"
          required={true}
          value={ethereumPrivKey}
        ></input>
        <input
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
          required={true}
          value={message}
        ></input>
        <button
          style={{
            padding: "6px",
            margin: "8px",
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
            padding: "5px",
            margin: "8px",
            height: "50px",
            width: "150px",
            fontSize: "15px",
          }}
          onClick={getUserName}
        >
          Get User Name
        </button>
      </header>
    </div>
  );
}

export default App;
