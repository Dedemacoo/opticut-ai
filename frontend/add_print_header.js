
const fs = require("fs");
let file = fs.readFileSync("src/app/page.tsx", "utf8");

// We need to inject the print header after `<div className="max-w-7xl mx-auto">` or similar
// Let"s find the main content div.
const searchStr = `<div className="flex-1 p-4 md:p-8 overflow-y-auto">`;
let insertPoint = file.indexOf(`<div className="mb-8 flex flex-col md:flex-row`);
if (insertPoint === -1) {
  insertPoint = file.indexOf(`<div className="flex justify-between items-center mb-8">`);
}
if (insertPoint === -1) {
  insertPoint = file.indexOf(`{!activeProject && (`); // fallback
}

if (insertPoint !== -1) {
  const printHeader = `
          {/* SADECE PDF/YAZDIRMA EKRANINDA GORUNECEK OLAN KURUMSAL HEADER */}
          <div className="hidden print:flex justify-between items-end mb-8 pb-4 border-b-2 border-slate-800">
            <div>
              <h1 className="text-3xl font-black text-black">Kesim Raporu</h1>
              <h2 className="text-xl font-bold text-slate-700 mt-2">{user?.company || "OptiCut Kullanıcısı"}</h2>
              <p className="text-slate-500 font-medium">{user?.name} ({user?.email})</p>
              <p className="text-slate-500 text-sm mt-1">Tarih: {new Date().toLocaleString("tr-TR")}</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <img src="/logo.png" alt="OptiCut Logo" className="h-10 mb-2 object-contain" />
              <p className="text-sm font-bold text-blue-600">OptiCut AI - Üretim Yönetimi</p>
              <p className="text-xs text-slate-500">www.opticut.com</p>
            </div>
          </div>
  `;
  
  // We need to place this right at the top of the content inside `main` or inside the main wrapper.
  // Actually, let"s just find `<div className="animate-in fade-in duration-500 max-w-7xl mx-auto">`
  const topWrapper = file.indexOf(`className="animate-in fade-in duration-500 max-w-7xl mx-auto"`);
  if (topWrapper !== -1) {
    const bracketEnd = file.indexOf(">", topWrapper);
    file = file.substring(0, bracketEnd + 1) + printHeader + file.substring(bracketEnd + 1);
  } else {
    // fallback
    file = file.replace(`{!activeProject && (`, printHeader + `\n          {!activeProject && (`);
  }
}

// Update Excel Export
const excelStart = file.indexOf("const handleExportExcel = async () => {");
const excelEnd = file.indexOf("writeFile(wb,", excelStart);
const excelEndFull = file.indexOf("};", excelEnd) + 2;

const oldExcel = file.substring(excelStart, excelEndFull);

const newExcel = `const handleExportExcel = async () => {
    if (!result) return alert("Dışa aktarılacak bir sonuç yok.");
    const { utils, writeFile } = await import("xlsx");
    const wb = utils.book_new();
    
    const companyInfo = user?.company ? user.company : "OptiCut Kullanıcısı";
    const userInfo = user?.name ? user.name + " (" + user.email + ")" : "";

    const summaryData = [
      ["OPTICUT KESİM RAPORU", "", "", "YAZILIM BİLGİLERİ"],
      ["Firma:", companyInfo, "", "Program:", "OptiCut AI"],
      ["Hazırlayan:", userInfo, "", "Web:", "www.opticut.com"],
      ["Tarih:", new Date().toLocaleString(), "", "", ""],
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
    wsSummary["!cols"] = [{wch: 25}, {wch: 35}, {wch: 5}, {wch: 15}, {wch: 25}];
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
    wsPatterns["!cols"] = [{wch: 15}, {wch: 10}, {wch: 15}, {wch: 15}, {wch: 60}];
    utils.book_append_sheet(wb, wsPatterns, "Kesim Listesi");

    writeFile(wb, \`OptiCut_Rapor_\${new Date().getTime()}.xlsx\`);
  };`;

file = file.replace(oldExcel, newExcel);

fs.writeFileSync("src/app/page.tsx", file, "utf8");

