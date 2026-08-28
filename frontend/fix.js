
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf8");
content = content.replace("<img src/{chatAttachmentPreview} className=", "<img src={chatAttachmentPreview} className=");
fs.writeFileSync("src/app/page.tsx", content, "utf8");

