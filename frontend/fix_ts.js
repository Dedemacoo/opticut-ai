
const fs = require("fs");
let p = fs.readFileSync("src/app/page.tsx", "utf8");
p = p.replace("document.getElementById(\x27chat-container\x27)?.scrollHeight", "(document.getElementById(\x27chat-container\x27)?.scrollHeight || 0)");
fs.writeFileSync("src/app/page.tsx", p, "utf8");

