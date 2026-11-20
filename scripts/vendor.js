/* Copies the browser builds of npm dependencies into assets/vendor so the
   site stays a plain static folder (no CDN, no bundler).
   Run after changing dependencies:  npm install && npm run vendor */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "assets", "vendor", "gsap");
const dist = path.join(root, "node_modules", "gsap", "dist");

fs.mkdirSync(out, { recursive: true });
["gsap.min.js", "ScrollTrigger.min.js"].forEach(function (file) {
  fs.copyFileSync(path.join(dist, file), path.join(out, file));
  console.log("copied", file);
});

const version = require(path.join(root, "node_modules", "gsap", "package.json")).version;
fs.writeFileSync(
  path.join(out, "README.txt"),
  "GSAP " + version + " (gsap.min.js, ScrollTrigger.min.js)\n" +
  "Copied from node_modules by scripts/vendor.js.\n" +
  "License: https://gsap.com/standard-license\n"
);
