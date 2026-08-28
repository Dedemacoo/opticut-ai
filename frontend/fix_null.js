
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf8");
content = content.replace("document.getElementById('chat-container').scrollHeight", "document.getElementById('chat-container')?.scrollHeight");
fs.writeFileSync("src/app/page.tsx", content, "utf8");

