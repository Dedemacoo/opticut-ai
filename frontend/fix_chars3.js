
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf-8");

const replacements = {
  "zelliini kullanmak iin plannz ykseltmeniz": "özelliðini kullanmak için planýnýzý yükseltmeniz",
  "Da aktarlacak bir sonu": "Dýþa aktarýlacak bir sonuç",
  "Proje Ad": "Proje Adý",
  "zet Bilgiler": "Özet Bilgiler",
  "Bak Pay": "Býçak Payý",
  "Kullanlan Profil Says": "Kullanýlan Profil Sayýsý",
  "\"zet\"": "\"Özet\"",
  "Kesilecek Paralar": "Kesilecek Parçalar",
  "Kesim Haritas": "Kesim Haritasý",
  "Sipari": "Sipariþ",
  "Sipariþ": "Sipariþ",
  "Gemi Proje Sonucu": "Geçmiþ Proje Sonucu",
  "Yeni retim Plan": "Yeni Üretim Planý",
  "yklenen": "yüklenen",
  "AI Fotoraf Ykleme": "AI Fotoðraf Yükleme",
  "AI Ykleme Modl Alyor": "AI Yükleme Modülü Açýlýyor",
  "izim fotoraf ekerek": "Çizim fotoðrafý çekerek",
  "konuarak liste oluturun": "konuþarak liste oluþturun",
  "AI ile Olutur": "AI ile Oluþtur",
  "iWindoor 2D izim Modl": "iWindoor 2D Çizim Modülü",
  "Grsel olarak pencere/kap tasarlayn": "Görsel olarak pencere/kapý tasarlayýn",
  "Excel Ykle": "Excel Yükle",
  "Da Aktar": "Dýþa Aktar",
  "Sonuç Ekraný": "Sonuç Ekraný",
  "Sonuçlar": "Sonuçlar",
  "Ykleniyor": "Yükleniyor",
};

for (const [bad, good] of Object.entries(replacements)) {
    content = content.replace(new RegExp(bad, "g"), good);
}

fs.writeFileSync("src/app/page.tsx", content, "utf-8");

