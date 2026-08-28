
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf-8");
const lines = content.split("\n");

lines[25] = "      setUpgradeMessage(`\"${feature}\" özelliðini kullanmak için planýnýzý yükseltmeniz gerekmektedir.`);";
lines[146] = "    if (!result) return alert(\"Dýþa aktarýlacak bir sonuç yok.\");";
lines[152] = "      [\"Proje Adý\", \"Proje #\" + activeProject],";
lines[155] = "      [\"Özet Bilgiler\", \"\"],";
lines[157] = "      [\"Býçak Payý / Kerf (mm)\", result.blade_width || kerf],";
lines[158] = "      [\"Kullanýlan Profil Sayýsý\", result.total_stocks_used],";
lines[164] = "    utils.book_append_sheet(wb, wsSummary, \"Özet\");";
lines[167] = "      [\"Desen No\", \"Adet\", \"Verimlilik (%)\", \"Fire (mm)\", \"Kesilecek Parçalar (mm)\"]";
lines[182] = "    utils.book_append_sheet(wb, wsPatterns, \"Kesim Haritasý\");";
lines[199] = "        body: JSON.stringify({ name: \"Sipariþ #\" + Math.floor(Math.random() * 1000) }),";
lines[203] = "      // 2. Sipariþleri ekle";
lines[242] = "            <h2 className=\"text-2xl font-bold text-slate-100\">{activeProject ? \"Geçmiþ Proje Sonucu\" : \"Yeni Üretim Planý\"}</h2>";
lines[243] = "            <p className=\"text-slate-500 text-sm mt-1\">{activeProject ? \"Sistemden yüklenen eski bir hesaplama.\" : \"En az malzemeyle maksimum verimlilik.\"}</p>";
lines[249] = "              onClick={() => handleFeatureClick(\"AI Fotoðraf Yükleme ve OptiCut Copilot\", \"Pro Plus\", () => { alert(\"AI Yükleme Modülü Açýlýyor (Mock)\") })}";
lines[251] = "              title=\"Çizim fotoðrafý çekerek veya AI ile konuþarak liste oluþturun\"";
lines[255] = "              AI ile Oluþtur";
lines[260] = "              onClick={() => handleFeatureClick(\"iWindoor 2D Çizim Modülü\", \"Pro\", () => setShowDesigner(true))}";
lines[262] = "              title=\"Görsel olarak pencere/kapý tasarlayýn\"";
lines[281] = "              Excel Yükle";
lines[291] = "                  Dýþa Aktar";
lines[407] = "            {/* Ortadaki Sonuç Ekraný */}";
lines[430] = "        {/* Sonuçlar */}";
lines[503] = "            {/* Görsel Kesim Haritasý */}";
lines[508] = "                  Görsel Kesim Haritasý";
lines[534] = "                    {/* Progress Bar Kesim Haritasý */}";
lines[615] = "    <Suspense fallback={<div className=\"flex h-screen items-center justify-center text-white\">Yükleniyor...</div>}>";

fs.writeFileSync("src/app/page.tsx", lines.join("\n"), "utf-8");

