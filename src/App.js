import React from "react";
import PasswordGenerator from "./PasswordGenerator";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>PassCrafter - Random Password Generator</h1>
        <PasswordGenerator />
      </header>
    </div>
  );
}

export default App;
