
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf-8");
const lines = content.split("\n");

lines[25] = "      setUpgradeMessage(`\"${feature}\" özelliğini kullanmak için planınızı yükseltmeniz gerekmektedir.`);";
lines[146] = "    if (!result) return alert(\"Dışa aktarılacak bir sonuç yok.\");";
lines[152] = "      [\"Proje Adı\", \"Proje #\" + activeProject],";
lines[155] = "      [\"Özet Bilgiler\", \"\"],";
lines[157] = "      [\"Bıçak Payı / Kerf (mm)\", result.blade_width || kerf],";
lines[158] = "      [\"Kullanılan Profil Sayısı\", result.total_stocks_used],";
lines[164] = "    utils.book_append_sheet(wb, wsSummary, \"Özet\");";
lines[167] = "      [\"Desen No\", \"Adet\", \"Verimlilik (%)\", \"Fire (mm)\", \"Kesilecek Parçalar (mm)\"]";
lines[182] = "    utils.book_append_sheet(wb, wsPatterns, \"Kesim Haritası\");";
lines[199] = "        body: JSON.stringify({ name: \"Sipariş #\" + Math.floor(Math.random() * 1000) }),";
lines[203] = "      // 2. Siparişleri ekle";
lines[242] = "            <h2 className=\"text-2xl font-bold text-slate-100\">{activeProject ? \"Geçmiş Proje Sonucu\" : \"Yeni Üretim Planı\"}</h2>";
lines[243] = "            <p className=\"text-slate-500 text-sm mt-1\">{activeProject ? \"Sistemden yüklenen eski bir hesaplama.\" : \"En az malzemeyle maksimum verimlilik.\"}</p>";
lines[249] = "              onClick={() => handleFeatureClick(\"AI Fotoğraf Yükleme ve OptiCut Copilot\", \"Pro Plus\", () => { alert(\"AI Yükleme Modülü Açılıyor (Mock)\") })}";
lines[251] = "              title=\"Çizim fotoğrafı çekerek veya AI ile konuşarak liste oluşturun\"";
lines[255] = "              AI ile Oluştur";
lines[260] = "              onClick={() => handleFeatureClick(\"iWindoor 2D Çizim Modülü\", \"Pro\", () => setShowDesigner(true))}";
lines[262] = "              title=\"Görsel olarak pencere/kapı tasarlayın\"";
lines[281] = "              Excel Yükle";
lines[291] = "                  Dışa Aktar";
lines[407] = "            {/* Ortadaki Sonuç Ekranı */}";
lines[430] = "        {/* Sonuçlar */}";
lines[503] = "            {/* Görsel Kesim Haritası */}";
lines[508] = "                  Görsel Kesim Haritası";
lines[534] = "                    {/* Progress Bar Kesim Haritası */}";
lines[615] = "    <Suspense fallback={<div className=\"flex h-screen items-center justify-center text-white\">Yükleniyor...</div>}>";

fs.writeFileSync("src/app/page.tsx", lines.join("\n"), "utf-8");

