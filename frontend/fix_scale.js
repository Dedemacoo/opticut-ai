
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf8");
content = content.replace(`className="w-full h-full object-cover scale-150 relative z-10"`, `className="w-full h-full object-cover relative z-10"`);
fs.writeFileSync("src/app/page.tsx", content, "utf8");

