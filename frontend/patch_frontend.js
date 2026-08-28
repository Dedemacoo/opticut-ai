
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf8");

content = content.replace(
  /setChatMessages\(prev => \[\.\.\.prev, \{ role: "ai", text: `Harika! Gönderdiğin görsele\/metne göre \$\{result\.orders\.length\} adet parça buldum ve hemen arka plandaki listene ekledim\. \\n\\nBaşka bir liste eklemek ister misin\?` \}\]\);/g,
  `setChatMessages(prev => [...prev, { role: "ai", text: result.reply ? result.reply + "\\n\\n(Arka plana " + result.orders.length + " parça eklendi ✨)" : "Harika! Parçaları arka plana ekledim." }]);`
);

fs.writeFileSync("src/app/page.tsx", content, "utf8");

