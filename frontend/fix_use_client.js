
const fs = require("fs");

function fixFile(path) {
  let content = fs.readFileSync(path, "utf8");
  content = content.replace("import { API_BASE_URL } from \"@/config\";\n", "");
  content = content.replace("\"use client\";\n", "");
  content = "\"use client\";\n\nimport { API_BASE_URL } from \"@/config\";\n" + content;
  fs.writeFileSync(path, content, "utf8");
}

fixFile("src/app/page.tsx");
fixFile("src/components/DashboardLayout.tsx");

