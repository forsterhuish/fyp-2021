import { useState } from 'react';
import { ethers } from 'ethers';
import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";
import './App.css';

function App() {
  const [userAccount, setUserAccount] = useState("");
  const [userName, setUserName] = useState("");
  const [ethereumPrivKey, setEthereumPrivKey] = useState("");
  const [successor, setSuccessor] = useState([]); // list of ethereum priv keys
  const willAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

  const requestAccount = async () => {
    // connect to Metamask wallet of user when we need to create a transaction
    await window.ethereum.request({ method: "eth_requestAccounts" }); // request Metamask account info from user
  }

  const submitWill = async () => {
    const Will = await ethers.getContractFactory("Will");
    const userWill = await Greeter.deploy(userName, ethereumPrivKey);
  
    await userWill.deployed();
  
    console.log("Will deployed to:", userWill.address);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Will creation form</h1>
        <h3>Please input all following fields</h3>

        <input onChange={(e) => setUserName(e.target.value)} placeholder="User Name" required={true}></input>
        <input onChange={(e) => setEthereumPrivKey(e.target.value)} placeholder="Ethereum Priv Key" required={true}></input>
        <button style={{ padding: "5px", margin: "8px", height: "50px", width: "100px", fontSize: "20px"}} onClick={submitWill}>Submit</button>
      </header>
    </div>
  );
}

export default App;
