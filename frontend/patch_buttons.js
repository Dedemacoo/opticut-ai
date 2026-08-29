
const fs = require("fs");
let file = fs.readFileSync("src/app/page.tsx", "utf8");

file = file.replace(
  ">Excel Y\\u016ckle<", 
  ">Iceri Aktar (Excel)<"
);

file = file.replace(
  "Excel Y\\u016Ckle", 
  "Iceri Aktar (Excel)"
);

file = file.replace(
  ">D\\u0131\\u015fa Aktar<", 
  ">Disa Aktar (Excel)<"
);

file = file.replace(
  ">PDF<", 
  ">PDF Indir<"
);

fs.writeFileSync("src/app/page.tsx", file, "utf8");

