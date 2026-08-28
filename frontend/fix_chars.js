
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf-8");

content = content.replace(/Ge\?mi\? Proje Sonucu/g, "Geçmiþ Proje Sonucu");
content = content.replace(/Yeni \?retim Plan\?/g, "Yeni Üretim Planý");
content = content.replace(/iWindoor 2D \?izim/g, "iWindoor 2D Çizim");
content = content.replace(/AI Foto\?raf Y\?kleme/g, "AI Fotoðraf Yükleme");
content = content.replace(/Sunucuya ba\?lan\?lamad\?/g, "Sunucuya baðlanýlamadý.");
content = content.replace(/Optimizasyon Hatas\?/g, "Optimizasyon Hatasý");

// other manual cleanups
content = content.replace(/Ykleniyor/g, "Yükleniyor");
content = content.replace(/-nce/g, "Önce");
content = content.replace(/retim/g, "Üretim");
content = content.replace(/Sipari/g, "Sipariþ");
content = content.replace(/para/g, "parça");
content = content.replace(/Sonu/g, "Sonuç");
content = content.replace(/alYtr/g, "çalýþtýr");
content = content.replace(/baYarl/g, "baþarýlý");

fs.writeFileSync("src/app/page.tsx", content, "utf-8");

