
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf-8");

content = content.replace("return (\n    <main", "return (\n    <>\n      <main");
content = content.replace("      `}} />\n    </main>\n  );\n}", "      `}} />\n    </>\n  );\n}");

fs.writeFileSync("src/app/page.tsx", content, "utf-8");
console.log("Fixed wrapper");

