
import re

with open("src/app/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import WindowDesigner from \"@/components/WindowDesigner\";",
    "import WindowDesigner from \"@/components/WindowDesigner\";\nimport { usePlan } from \"@/context/PlanContext\";\nimport { Suspense } from \"react\";"
)

# 2. Function rename and Suspense Wrapper
content = content.replace("export default function Home() {", "function HomeContent() {")
suspense_wrapper = """
export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-white">Yükleniyor...</div>}>
      <HomeContent />
    </Suspense>
  );
}
"""
content = content + suspense_wrapper

# 3. Add usePlan and Modal states
state_injections = """  const { plan } = usePlan();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [upgradeTargetPlan, setUpgradeTargetPlan] = useState("");

  const handleFeatureClick = (feature: string, requiredPlan: string, action: () => void) => {
    const plans = ["Standart", "Pro", "Pro Plus"];
    const currentIdx = plans.indexOf(plan);
    const requiredIdx = plans.indexOf(requiredPlan);

    if (currentIdx >= requiredIdx) {
      action();
    } else {
      setUpgradeMessage(`"${feature}" özelliðini kullanmak için planýnýzý yükseltmeniz gerekmektedir.`);
      setUpgradeTargetPlan(requiredPlan);
      setShowUpgradeModal(true);
    }
  };
"""
content = content.replace(
    "const router = useRouter();",
    "const router = useRouter();\n" + state_injections
)

# 4. Add Export functions
export_funcs = """
  const handleExportExcel = async () => {
    if (!result) return alert("Dýþa aktarýlacak bir sonuç yok.");
    const { utils, writeFile } = await import("xlsx");
    const wb = utils.book_new();
    
    const summaryData = [
      ["OptiCut Kesim Raporu"],
      ["Proje Adý", "Proje #" + activeProject],
      ["Tarih", new Date().toLocaleString()],
      [""],
      ["Özet Bilgiler", ""],
      ["Stok Boyu (mm)", result.stock_length || stockLength],
      ["Býçak Payý / Kerf (mm)", result.blade_width || kerf],
      ["Kullanýlan Profil Sayýsý", result.total_stocks_used],
      ["Toplam Kesim Adedi", result.patterns.reduce((s: any, p: any) => s + p.cuts.length * p.usage_count, 0)],
      ["Toplam Fire (mm)", result.total_waste],
      ["Toplam Fire (metre)", (result.total_waste / 1000).toFixed(2)]
    ];
    const wsSummary = utils.aoa_to_sheet(summaryData);
    utils.book_append_sheet(wb, wsSummary, "Özet");

    const patternsData = [
      ["Desen No", "Adet", "Verimlilik (%)", "Fire (mm)", "Kesilecek Parçalar (mm)"]
    ];
    
    result.patterns.forEach((pattern: any, idx: number) => {
      const efficiency = ((1 - pattern.waste / (result.stock_length || Number(stockLength))) * 100).toFixed(1);
      patternsData.push([
        (idx + 1).toString(),
        pattern.usage_count.toString(),
        `${efficiency}%`,
        pattern.waste.toFixed(0),
        pattern.cuts.join(", ")
      ]);
    });
    
    const wsPatterns = utils.aoa_to_sheet(patternsData);
    utils.book_append_sheet(wb, wsPatterns, "Kesim Haritasý");

    writeFile(wb, `OptiCut_Rapor_${new Date().getTime()}.xlsx`);
  };

  const handleExportPdf = () => {
    window.print();
  };
"""
content = content.replace(
    "const optimize = async () => {",
    export_funcs + "\n  const optimize = async () => {"
)

# 5. UI Updates (Buttons)
buttons_old = """            <button 
              onClick={() => setShowDesigner(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-900/20 border border-indigo-500/50 px-4 md:px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0"
              title="Görsel olarak pencere/kapý tasarlayýn"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
              iWindoor 2D Çizim
            </button>
            <div className="w-px h-8 bg-slate-700 hidden md:block"></div>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="bg-emerald-900/30 hover:bg-emerald-800/40 text-emerald-400 border border-emerald-700/50 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Excel Yükle
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
              Dýþa Aktar
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              PDF
            </button>"""

buttons_new = """            <button 
              onClick={() => handleFeatureClick("AI Fotoðraf Yükleme ve OptiCut Copilot", "Pro Plus", () => { alert("AI Yükleme Modülü Açýlýyor (Mock)") })}
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] border border-pink-500/50 px-4 md:px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 relative overflow-hidden group"
              title="Çizim fotoðrafý çekerek veya AI ile konuþarak liste oluþturun"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -translate-x-full skew-x-12"></div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              AI ile Oluþtur
              {plan !== "Pro Plus" && <svg className="w-3.5 h-3.5 ml-1 opacity-70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
            </button>

            <button 
              onClick={() => handleFeatureClick("iWindoor 2D Çizim Modülü", "Pro", () => setShowDesigner(true))}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-900/20 border border-indigo-500/50 px-4 md:px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0"
              title="Görsel olarak pencere/kapý tasarlayýn"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
              iWindoor 2D
              {plan === "Standart" && <svg className="w-3.5 h-3.5 ml-1 opacity-70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
            </button>
            <div className="w-px h-8 bg-slate-700 hidden md:block"></div>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="print:hidden bg-emerald-900/30 hover:bg-emerald-800/40 text-emerald-400 border border-emerald-700/50 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Excel Yükle
            </button>
            
            {activeProject && (
              <>
                <button 
                  onClick={handleExportExcel}
                  className="print:hidden bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                  Dýþa Aktar
                </button>
                <button 
                  onClick={handleExportPdf}
                  className="print:hidden bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  PDF
                </button>
              </>
            )}"""
if buttons_old in content:
    content = content.replace(buttons_old, buttons_new)
else:
    print("Warning: Buttons block not found")

# 6. Add Modal before WindowDesigner
modal = """
      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e293b] w-full max-w-md p-8 rounded-3xl border border-slate-700 shadow-2xl">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white text-center mb-2">Planýnýzý Yükseltin</h3>
            <p className="text-slate-400 text-center text-sm mb-6 leading-relaxed">
              {upgradeMessage}
            </p>
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Gereken Plan:</span>
                <span className="bg-amber-500/20 text-amber-400 font-bold px-3 py-1 rounded-lg text-sm border border-amber-500/30">{upgradeTargetPlan}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition-colors"
              >
                Vazgeç
              </button>
              <button 
                onClick={() => { setShowUpgradeModal(false); router.push("/settings"); }}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-900/40 transition-colors"
              >
                Planlarý Ýncele
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2D Çizim Modülü */}"""
content = content.replace("{/* 2D Çizim Modülü */}", modal)

with open("src/app/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fix script completed.")

