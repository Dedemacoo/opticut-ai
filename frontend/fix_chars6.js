
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf-8");

content = content.replace(/\uFFFDzelli\uFFFDini/g, "özelliðini");
content = content.replace(/i\uFFFDin/g, "için");
content = content.replace(/plan\uFFFDn\uFFFDz\uFFFD/g, "planýnýzý");
content = content.replace(/y\uFFFDKseltmeniz/g, "yükseltmeniz");

content = content.replace(/D\uFFFD\uFFFDa aktar\uFFFClacak/g, "Dýþa aktarýlacak");
content = content.replace(/sonu\uFFFD/g, "sonuç");
content = content.replace(/Proje Ad\uFFFD/g, "Proje Adý");
content = content.replace(/\uFFFDzet Bilgiler/g, "Özet Bilgiler");
content = content.replace(/B\uFFFD\uFFFDak Pay\uFFFD/g, "Býçak Payý");
content = content.replace(/Kullan\uFFFClan Profil Say\uFFFDs\uFFFD/g, "Kullanýlan Profil Sayýsý");
content = content.replace(/"\uFFFDzet"/g, "\"Özet\"");
content = content.replace(/Kesilecek Par\uFFFDalar/g, "Kesilecek Parçalar");
content = content.replace(/Kesim Haritas\uFFFD/g, "Kesim Haritasý");
content = content.replace(/Sipari\uFFFD/g, "Sipariþ");
content = content.replace(/Ge\uFFFDmi\uFFFD Proje/g, "Geçmiþ Proje");
content = content.replace(/Yeni \uFFFDretim Plan\uFFFD/g, "Yeni Üretim Planý");
content = content.replace(/y\uFFFDKlenen/g, "yüklenen");
content = content.replace(/Foto\uFFFDRaf/gi, "Fotoðraf");
content = content.replace(/Y\uFFFDKleme/g, "Yükleme");
content = content.replace(/Mod\uFFFDl\uFFFD/g, "Modülü");
content = content.replace(/A\uFFFCl\uFFFCDyor/g, "Açýlýyor");
content = content.replace(/\uFFFDizim/g, "Çizim");
content = content.replace(/\uFFFDekerek/g, "çekerek");
content = content.replace(/konu\uFFFCDarak/g, "konuþarak");
content = content.replace(/olu\uFFFDturun/g, "oluþturun");
content = content.replace(/Olu\uFFFDtur/g, "Oluþtur");
content = content.replace(/G\uFFFDRsel/g, "Görsel");
content = content.replace(/kap\uFFFD/g, "kapý");
content = content.replace(/tasarlay\uFFFDn/g, "tasarlayýn");
content = content.replace(/Y\uFFFDKle/g, "Yükle");
content = content.replace(/D\uFFFD\uFFFDa Aktar/g, "Dýþa Aktar");
content = content.replace(/Sonu\uFFFD\u00E7/g, "Sonuç");
content = content.replace(/Haritas\uFFFD\u0131/g, "Haritasý");
content = content.replace(/Y\uFFFDKleniyor/g, "Yükleniyor");
content = content.replace(/G\uFFFDRsel Kesim Haritas\uFFFDi/g, "Görsel Kesim Haritasý");
content = content.replace(/G\uFFFD/g, "Gö"); // catching any leftovers

fs.writeFileSync("src/app/page.tsx", content, "utf-8");

