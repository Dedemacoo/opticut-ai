
const fs = require("fs");
let content = fs.readFileSync("src/app/settings/page.tsx", "utf-8");

content = content.replace(/\uFFFD/g, ""); // Wait, I cant just replace them blindly. Let me use my previous strategy.

fs.writeFileSync("src/app/settings/page.tsx", content, "utf-8");

