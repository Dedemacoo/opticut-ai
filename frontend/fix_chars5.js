
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf-8");

// We match the whole word with \ufffd
content = content.replace(/\uFFFDzelli\uFFFDini kullanmak i\uFFFDin plan\uFFFDn\uFFFDz\uFFFD y\uFFFDKseltmeniz/g, "özelliðini kullanmak için planýnýzý yükseltmeniz");
content = content.replace(/D\uFFFD\uFFFD/g, "Dýþ");
content = content.replace(/D\uFFFD\uFFFDa/g, "Dýþa");
content = content.replace(/aktar\uFFFClacak/g, "aktarýlacak");
content = content.replace(/sonu\uFFFD/g, "sonuç");
content = content.replace(/Ad\uFFFD\uFFFD\uFFFD/g, "Adý");
content = content.replace(/Ad\uFFFD\uFFFD/g, "Adý");
content = content.replace(/\uFFFD\uFFFD\uFFFDzet/g, "Özet");
content = content.replace(/\uFFFDzet/g, "Özet");
content = content.replace(/B\uFFFD\uFFFDak/g, "Býçak");
content = content.replace(/Pay\uFFFD/g, "Payý");
content = content.replace(/Kullan\uFFFClan/g, "Kullanýlan");
content = content.replace(/Say\uFFFDs\uFFFD/g, "Sayýsý");
content = content.replace(/Par\uFFFDalar/g, "Parçalar");
content = content.replace(/Haritas\uFFFD\uFFFD\uFFFD/g, "Haritasý");
content = content.replace(/Haritas\uFFFD\uFFFD/g, "Haritasý");
content = content.replace(/Haritas\uFFFD/g, "Haritasý");
content = content.replace(/Sipari\uFFFD\uFFFD\u015F/g, "Sipariþ");
content = content.replace(/Sipari\uFFFD/g, "Sipariþ");
content = content.replace(/Ge\uFFFDmi\uFFFD/g, "Geçmiþ");
content = content.replace(/Sonu\uFFFDcu/g, "Sonucu");
content = content.replace(/\uFFFD\uFFFDretim/g, "Üretim");
content = content.replace(/Plan\uFFFD/g, "Planý");
content = content.replace(/y\uFFFDKlenen/g, "yüklenen");
content = content.replace(/Foto\uFFFDRaf/g, "Fotoðraf");
content = content.replace(/Foto\uFFFDRaf/gi, "Fotoðraf");
content = content.replace(/Y\uFFFDKleme/g, "Yükleme");
content = content.replace(/Mod\uFFFDl\uFFFD/g, "Modülü");
content = content.replace(/A\uFFFCl\uFFFCDyor/g, "Açýlýyor");
content = content.replace(/\uFFFDizim/g, "Çizim");
content = content.replace(/foto\uFFFDRaf\uFFFD/g, "fotoðrafý");
content = content.replace(/\uFFFDekerek/g, "çekerek");
content = content.replace(/konu\uFFFCDarak/g, "konuþarak");
content = content.replace(/olu\uFFFDturun/g, "oluþturun");
content = content.replace(/Olu\uFFFDtur/g, "Oluþtur");
content = content.replace(/G\uFFFDRsel/g, "Görsel");
content = content.replace(/kap\uFFFD/g, "kapý");
content = content.replace(/tasarlay\uFFFDn/g, "tasarlayýn");
content = content.replace(/Y\uFFFDKle/g, "Yükle");
content = content.replace(/Y\uFFFDKleniyor/g, "Yükleniyor");
content = content.replace(/Gorsel Kesim/g, "Görsel Kesim");
content = content.replace(/Haritas\uFFFD\uFFFD\uFFFD/g, "Haritasý");
content = content.replace(/Haritas\uFFFD\uFFFD/g, "Haritasý");
content = content.replace(/Haritas\uFFFD/g, "Haritasý");
content = content.replace(/Haritas\uFFFD\uFFFD/g, "Haritasý");
content = content.replace(/Haritas\uFFFD\uFFFD/g, "Haritasý");
content = content.replace(/Haritas\uFFFD/gi, "Haritasý");

// Fix specific patterns missed
content = content.replace(/Gorsel Kesim Haritas\?\?i/gi, "Görsel Kesim Haritasý");

fs.writeFileSync("src/app/page.tsx", content, "utf-8");

