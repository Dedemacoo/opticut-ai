
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf-8");

const lines = content.split("\n");

for (let i = 0; i < lines.length; i++) {
  let l = lines[i];
  if (!l.includes("\uFFFD")) continue;

  if (l.includes("zelli")) l = l.replace(/\uFFFDzelli\uFFFDini kullanmak i\uFFFDin plan\uFFFDn\uFFFDz\uFFFD y\uFFFDkseltmeniz/, "özelliðini kullanmak için planýnýzý yükseltmeniz");
  if (l.includes("aktar")) l = l.replace(/D\uFFFD\uFFFDa aktar\uFFFClacak bir sonu\uFFFD/, "Dýþa aktarýlacak bir sonuç");
  if (l.includes("Proje Ad")) l = l.replace(/Proje Ad\uFFFD/, "Proje Adý");
  if (l.includes("zet Bilgiler")) l = l.replace(/\uFFFDzet Bilgiler/, "Özet Bilgiler");
  if (l.includes("ak Pay")) l = l.replace(/B\uFFFD\uFFFDak Pay\uFFFD/, "Býçak Payý");
  if (l.includes("Kullan")) l = l.replace(/Kullan\uFFFClan Profil Say\uFFFDs\uFFFD/, "Kullanýlan Profil Sayýsý");
  if (l.includes("zet\"")) l = l.replace(/"\uFFFDzet"/, "\"Özet\"");
  if (l.includes("Kesilecek Par")) l = l.replace(/Kesilecek Par\uFFFDalar/, "Kesilecek Parçalar");
  if (l.includes("Kesim Haritas")) l = l.replace(/Kesim Haritas\uFFFD/, "Kesim Haritasý");
  if (l.includes("Sipari")) l = l.replace(/Sipari\uFFFD/, "Sipariþ");
  if (l.includes("Sipari")) l = l.replace(/Sipari\uFFFDleri/, "Sipariþleri");
  if (l.includes("Ge")) l = l.replace(/Ge\uFFFDmi\uFFFD Proje Sonucu/, "Geçmiþ Proje Sonucu");
  if (l.includes("Yeni")) l = l.replace(/Yeni \uFFFDretim Plan\uFFFD/, "Yeni Üretim Planý");
  if (l.includes("Sistemden y")) l = l.replace(/Sistemden y\uFFFDklenen/, "Sistemden yüklenen");
  if (l.includes("AI Foto")) l = l.replace(/AI Foto\uFFFDRaf Y\uFFFDkleme/, "AI Fotoðraf Yükleme");
  if (l.includes("AI Foto")) l = l.replace(/AI Foto\uFFFDraf Y\uFFFDkleme/, "AI Fotoðraf Yükleme");
  if (l.includes("A")) l = l.replace(/A\uFFFCl\uFFFCDyor/, "Açýlýyor");
  if (l.includes("Mod")) l = l.replace(/Mod\uFFFDl\uFFFD/, "Modülü");
  if (l.includes("izim Foto")) l = l.replace(/\uFFFDizim Foto\uFFFDraf\uFFFD \uFFFDekerek veya AI ile konu\uFFFDarak liste olu\uFFFDturun/, "Çizim fotoðrafý çekerek veya AI ile konuþarak liste oluþturun");
  if (l.includes("AI ile Olu")) l = l.replace(/AI ile Olu\uFFFDtur/, "AI ile Oluþtur");
  if (l.includes("iWindoor")) l = l.replace(/iWindoor 2D \uFFFDizim Mod\uFFFDl\uFFFD/, "iWindoor 2D Çizim Modülü");
  if (l.includes("rsel olarak pencere")) l = l.replace(/G\uFFFDrsel olarak pencere\/kap\uFFFD tasarlay\uFFFDn/, "Görsel olarak pencere/kapý tasarlayýn");
  if (l.includes("Excel Y")) l = l.replace(/Excel Y\uFFFDkle/, "Excel Yükle");
  if (l.includes("Aktar")) l = l.replace(/D\uFFFD\uFFFDa Aktar/, "Dýþa Aktar");
  if (l.includes("Ortadaki Sonu")) l = l.replace(/Ortadaki Sonu\uFFFD Ekraný/, "Ortadaki Sonuç Ekraný");
  if (l.includes("Sonu")) l = l.replace(/Sonu\uFFFDlar/, "Sonuçlar");
  if (l.includes("Kesim Haritas")) l = l.replace(/Görsel Kesim Haritas\uFFFD/, "Görsel Kesim Haritasý");
  if (l.includes("Kesim Haritas")) l = l.replace(/Progress Bar Kesim Haritas\uFFFD/, "Progress Bar Kesim Haritasý");
  if (l.includes("rsel Kesim Haritas")) l = l.replace(/G\uFFFDrsel Kesim Haritas\uFFFDi/, "Görsel Kesim Haritasý");
  if (l.includes("Y")) l = l.replace(/Y\uFFFDkleniyor/, "Yükleniyor");

  lines[i] = l;
}

fs.writeFileSync("src/app/page.tsx", lines.join("\n"), "utf-8");

