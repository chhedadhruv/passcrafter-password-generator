const path = require("path");
const base = require("../tailwind.config.js");

// Same design tokens as the website; scan the popup and the shared components it renders.
module.exports = {
  ...base,
  content: [
    path.join(__dirname, "popup.html"),
    path.join(__dirname, "src/**/*.{js,jsx}"),
    path.join(__dirname, "../components/PasswordGenerator.js"),
    path.join(__dirname, "../components/VaultApp.js"),
    path.join(__dirname, "../components/CopyButton.js"),
  ],
};
