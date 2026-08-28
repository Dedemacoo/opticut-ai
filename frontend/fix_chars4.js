
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf-8");

// I can replace the  directly.
content = content.replace(/zelliini kullanmak iin plannz ykseltmeniz/g, "özelliðini kullanmak için planýnýzý yükseltmeniz");
content = content.replace(/Da aktarlacak bir sonu/g, "Dýþa aktarýlacak bir sonuç");
content = content.replace(/Proje Ad/g, "Proje Adý");
content = content.replace(/zet Bilgiler/g, "Özet Bilgiler");
content = content.replace(/Bak Pay/g, "Býçak Payý");
content = content.replace(/Kullanlan Profil Says/g, "Kullanýlan Profil Sayýsý");
content = content.replace(/"zet"/g, "\"Özet\"");
content = content.replace(/Kesilecek Paralar/g, "Kesilecek Parçalar");
content = content.replace(/Kesim Haritas/g, "Kesim Haritasý");
content = content.replace(/Sipariþ/g, "Sipariþ");
content = content.replace(/Gemi Proje Sonucu/g, "Geçmiþ Proje Sonucu");
content = content.replace(/Yeni retim Plan/g, "Yeni Üretim Planý");
content = content.replace(/yklenen/g, "yüklenen");
content = content.replace(/AI Fotoraf Ykleme/g, "AI Fotoðraf Yükleme");
content = content.replace(/AI Ykleme Modl Alyor/g, "AI Yükleme Modülü Açýlýyor");
content = content.replace(/izim fotoraf ekerek/g, "Çizim fotoðrafý çekerek");
content = content.replace(/konuarak liste oluturun/g, "konuþarak liste oluþturun");
content = content.replace(/AI ile Olutur/g, "AI ile Oluþtur");
content = content.replace(/iWindoor 2D izim Modl/g, "iWindoor 2D Çizim Modülü");
content = content.replace(/Grsel olarak pencere\/kap tasarlayn/g, "Görsel olarak pencere/kapý tasarlayýn");
content = content.replace(/Excel Ykle/g, "Excel Yükle");
content = content.replace(/Da Aktar/g, "Dýþa Aktar");
content = content.replace(/Sonuç/g, "Sonuç");
content = content.replace(/Ykleniyor/g, "Yükleniyor");

fs.writeFileSync("src/app/page.tsx", content, "utf-8");

