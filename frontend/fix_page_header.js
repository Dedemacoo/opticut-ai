
const fs = require("fs");

let p = fs.readFileSync("src/app/page.tsx", "utf8");
p = p.replace("\"use client\";\n\nimport { API_BASE_URL } from \"@/config\";\n\"use client\";", "\"use client\";\n\nimport { API_BASE_URL } from \"@/config\";");
fs.writeFileSync("src/app/page.tsx", p, "utf8");

let d = fs.readFileSync("src/components/DashboardLayout.tsx", "utf8");
d = d.replace("\"use client\";\n\nimport { API_BASE_URL } from \"@/config\";\n\"use client\";", "\"use client\";\n\nimport { API_BASE_URL } from \"@/config\";");
fs.writeFileSync("src/components/DashboardLayout.tsx", d, "utf8");

