
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf8");
content = content.replace(`className="w-full h-full object-cover scale-[1.3] relative z-10"`, `className="w-full h-full object-cover object-[center_20%] scale-110 relative z-10"`);
fs.writeFileSync("src/app/page.tsx", content, "utf8");

