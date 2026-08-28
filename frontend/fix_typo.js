
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf8");
content = content.replace("e.target.files?[[0];", "e.target.files?.[0];");
fs.writeFileSync("src/app/page.tsx", content, "utf8");

