import { useState } from "react";
// import { ethers } from "ethers";
import "./App.css";

function App() {
  const [newUser, setNewUser] = useState(true);
  return (
    <div className="App">
      <header className="App-header">
        <h1>Online Will System</h1>
        <h3 style={{ float: "left" }}>New user</h3>
        <input
          style={{
            alignItems: "center",
          }}
          type="radio"
          name="new user"
          value="new user"
          onChange={() => {
            setNewUser(true);
            console.log(newUser);
          }}
        />
        <input
          style={{
            alignItems: "center",
          }}
          type="radio"
          name="existing user"
          onChange={() => {
            setNewUser(false);
            console.log(newUser);
          }}
        />
      </header>
    </div>
  );
}

export default App;
