
const fs = require("fs");

// Update page.tsx
let page = fs.readFileSync("src/app/page.tsx", "utf8");
if (!page.includes("import { API_BASE_URL }")) {
  page = "import { API_BASE_URL } from \"@/config\";\n" + page;
}
page = page.replaceAll("http://127.0.0.1:8000", "${API_BASE_URL}");
page = page.replaceAll("\"${API_BASE_URL}/", "`" + "${API_BASE_URL}/");
page = page.replaceAll("/projects/\"", "/projects/`");
page = page.replaceAll("/api/ai-analyze\"", "/api/ai-analyze`");
fs.writeFileSync("src/app/page.tsx", page, "utf8");

// Update DashboardLayout.tsx
let dash = fs.readFileSync("src/components/DashboardLayout.tsx", "utf8");
if (!dash.includes("import { API_BASE_URL }")) {
  dash = "import { API_BASE_URL } from \"@/config\";\n" + dash;
}
dash = dash.replaceAll("http://127.0.0.1:8000", "${API_BASE_URL}");
dash = dash.replaceAll("\"${API_BASE_URL}/", "`" + "${API_BASE_URL}/");
dash = dash.replaceAll("/projects/\"", "/projects/`");
fs.writeFileSync("src/components/DashboardLayout.tsx", dash, "utf8");

