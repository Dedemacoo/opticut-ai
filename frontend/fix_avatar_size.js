
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf8");
content = content.replace("w-11 h-11 rounded-full relative overflow-hidden", "w-14 h-14 rounded-full relative overflow-hidden");
content = content.replace("scale-125", "scale-[1.3]");
fs.writeFileSync("src/app/page.tsx", content, "utf8");

