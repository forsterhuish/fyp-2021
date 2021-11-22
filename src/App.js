import { useState } from 'react';
import { ethers } from 'ethers';
import Will from "./artifacts/contracts/Greeter.sol/Greeter.json";
import './App.css';

function App() {
  const [userAccount, setUserAccount] = useState(" ");
  const [userName, setUserName] = useState(" ");
  const [ethereumPrivKey, setEthereumPrivKey] = useState("");
  const [successor, setSuccessor] = useState([]); // list of ethereum priv keys
  const willAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const requestAccount = async () => {
    // connect to Metamask wallet of user when we need to create a transaction
    await window.ethereum.request({ method: "eth_requestAccounts" }); // request Metamask account info from user
  }

  const submitWill = async () => {
    if (typeof window.ethereum === "undefined") {
      await requestAccount();
    }
    if (userName.length === 0 || ethereumPrivKey.length === 0) {
      console.log("error")
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const newWill = new ethers.Contract(willAddress, Will.abi, provider);
    newWill.setUserName(userName);
    newWill.setEthereumPrivKey(ethereumPrivKey);
    console.log("Will submitted");
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Will creation form</h1>
        <h3>Please input all following fields</h3>

        <input onChange={(e) => setUserName(e.target.value)} placeholder="User Name" required={true}></input>
        <input onChange={(e) => setEthereumPrivKey(e.target.value)} placeholder="Ethereum Priv Key" required={true}></input>
        <button style={{ padding: "5px", margin: "8px", height: "50px", width: "100px", fontSize: "20px"}} onClick={submitWill}>Confirm</button>
        <button style={{ padding: "5px", margin: "8px", height: "50px", width: "100px", fontSize: "20px"}} onClick={() => console.log("username is ", userName)}>Retrieve</button>
      </header>
    </div>
  );
}

export default App;
