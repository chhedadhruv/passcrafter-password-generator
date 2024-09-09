import React, { useState, useEffect } from "react";
import "./PasswordGenerator.css";

const PasswordGenerator = () => {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(false);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(false);
  const [includeSymbols, setIncludeSymbols] = useState(false);

  const handleToggleChange = () => {
    if (
      !includeUppercase &&
      !includeLowercase &&
      !includeNumbers &&
      !includeSymbols
    ) {
      setIncludeLowercase(true);
    }
  };

  const generatePassword = () => {
    const lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
    const uppercaseLetters = lowercaseLetters.toUpperCase();
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+=";

    let characterList = "";
    const charactersToInclude = [];

    if (includeLowercase) {
      characterList += lowercaseLetters;
      charactersToInclude.push(
        lowercaseLetters[Math.floor(Math.random() * lowercaseLetters.length)]
      );
    }
    if (includeUppercase) {
      characterList += uppercaseLetters;
      charactersToInclude.push(
        uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)]
      );
    }
    if (includeNumbers) {
      characterList += numbers;
      charactersToInclude.push(
        numbers[Math.floor(Math.random() * numbers.length)]
      );
    }
    if (includeSymbols) {
      characterList += symbols;
      charactersToInclude.push(
        symbols[Math.floor(Math.random() * symbols.length)]
      );
    }

    if (characterList.length === 0) {
      alert("Please select at least one character set!");
      return;
    }

    let generatedPassword = charactersToInclude.join("");
    for (let i = charactersToInclude.length; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characterList.length);
      generatedPassword += characterList[randomIndex];
    }

    generatedPassword = shuffleString(generatedPassword);

    setPassword(generatedPassword);
  };

  const shuffleString = (str) => {
    const arr = str.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join("");
  };

  const copyToClipboard = () => {
    const el = document.createElement("textarea");
    el.value = password;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    alert("Password copied to clipboard");
  };

  useEffect(() => {
    generatePassword();
  }, [
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
  ]);

  return (
    <div className="password-generator">
      <div className="control-group">
        <label>Password Length: {length}</label>
        <input
          type="range"
          min="4"
          max="20"
          value={length}
          onChange={(e) => setLength(e.target.value)}
        />
      </div>

      <div className="toggles">
        <div className="toggle">
          <span>Include Uppercase</span>
          <div
            className={`switch ${includeUppercase ? "active" : ""}`}
            onClick={() => {
              setIncludeUppercase(!includeUppercase);
              handleToggleChange();
            }}
          >
            <div className="toggle-handle" />
          </div>
        </div>

        <div className="toggle">
          <span>Include Lowercase</span>
          <div
            className={`switch ${includeLowercase ? "active" : ""}`}
            onClick={() => {
              setIncludeLowercase(!includeLowercase);
              handleToggleChange();
            }}
          >
            <div className="toggle-handle" />
          </div>
        </div>

        <div className="toggle">
          <span>Include Numbers</span>
          <div
            className={`switch ${includeNumbers ? "active" : ""}`}
            onClick={() => {
              setIncludeNumbers(!includeNumbers);
              handleToggleChange();
            }}
          >
            <div className="toggle-handle" />
          </div>
        </div>

        <div className="toggle">
          <span>Include Symbols</span>
          <div
            className={`switch ${includeSymbols ? "active" : ""}`}
            onClick={() => {
              setIncludeSymbols(!includeSymbols);
              handleToggleChange();
            }}
          >
            <div className="toggle-handle" />
          </div>
        </div>
      </div>

      <button className="generate-btn" onClick={generatePassword}>
        Generate Password
      </button>

      {password && (
        <div className="output">
          <h3>Your Password:</h3>
          <p>{password}</p>
          <button className="copy-btn" onClick={copyToClipboard}>
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};

export default PasswordGenerator;
