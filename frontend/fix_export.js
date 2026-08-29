
const fs = require("fs");
let file = fs.readFileSync("src/app/page.tsx", "utf8");

const startIdx = file.indexOf("const handleExportExcel = async () => {");
const endIdx = file.indexOf("writeFile(wb,", startIdx);
const fullEnd = file.indexOf("};", endIdx) + 2;

const replaceFunc = `const handleExportExcel = async () => {
    if (!result) return alert("Dışa aktarılacak bir sonuç yok.");
    const { utils, writeFile } = await import("xlsx");
    const wb = utils.book_new();
    
    const companyInfo = user?.company ? user.company : "OptiCut Kullanıcısı";
    const userInfo = user?.name ? user.name + " (" + user.email + ")" : "";

    const summaryData = [
      ["OPTICUT KESİM RAPORU"],
      ["Firma:", companyInfo],
      ["Hazırlayan:", userInfo],
      ["Tarih:", new Date().toLocaleString()],
      [""],
      ["-- ÖZET BİLGİLER --", ""],
      ["Stok Boyu (mm)", result.stock_length || stockLength],
      ["Bıçak Payı / Kerf (mm)", result.blade_width || kerf],
      ["Kullanılan Profil Sayısı", result.total_stocks_used],
      ["Toplam Kesim Adedi", result.patterns.reduce((s: any, p: any) => s + p.cuts.length * p.usage_count, 0)],
      ["Toplam Fire (mm)", result.total_waste],
      ["Toplam Fire (metre)", (result.total_waste / 1000).toFixed(2)]
    ];
    
    const wsSummary = utils.aoa_to_sheet(summaryData);
    wsSummary["!cols"] = [{wch: 30}, {wch: 30}];
    utils.book_append_sheet(wb, wsSummary, "Özet");

    const patternsData = [
      ["Profil No", "Adet", "Verimlilik (%)", "Fire (mm)", "Kesilecek Parçalar (mm)"]
    ];
    
    result.patterns.forEach((pattern: any, idx: number) => {
      const efficiency = ((1 - pattern.waste / (result.stock_length || Number(stockLength))) * 100).toFixed(1);
      patternsData.push([
        "Profil " + (idx + 1),
        pattern.usage_count,
        efficiency,
        pattern.waste,
        pattern.cuts.join(", ")
      ]);
    });
    
    const wsPatterns = utils.aoa_to_sheet(patternsData);
    wsPatterns["!cols"] = [{wch: 15}, {wch: 10}, {wch: 15}, {wch: 15}, {wch: 50}];
    utils.book_append_sheet(wb, wsPatterns, "Kesim Listesi");

    writeFile(wb, \`OptiCut_Rapor_\${new Date().getTime()}.xlsx\`);
  };`;

file = file.substring(0, startIdx) + replaceFunc + file.substring(fullEnd);
fs.writeFileSync("src/app/page.tsx", file, "utf8");

