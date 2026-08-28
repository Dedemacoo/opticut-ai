
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf-8");

content = content.replace("Ge?mi? Proje Sonu?cu", "Geçmiþ Proje Sonucu");
content = content.replace("Yeni ??retim Plan?", "Yeni Üretim Planý");
content = content.replace("y?klenen", "yüklenen");
content = content.replace("AI Foto?raf Y?kleme", "AI Fotoðraf Yükleme");
content = content.replace("iWindoor 2D ?izim", "iWindoor 2D Çizim");

fs.writeFileSync("src/app/page.tsx", content, "utf-8");

