
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf-8");

const brokenBlock = `      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar p-6 md:p-8">
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              PDF Ýndir
            </button>
          </div>
        </div>`;

const fixedBlock = `      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar p-6 md:p-8">
        
        {/* Navbar for Mobile / Quick Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-slate-800 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">{activeProject ? "Geçmiþ Proje Sonucu" : "Yeni Üretim Planý"}</h2>
            <p className="text-slate-500 text-sm mt-1">{activeProject ? "Sistemden yüklenen eski bir hesaplama." : "En az malzemeyle maksimum verimlilik."}</p>
          </div>
          
          <div className="flex gap-2 md:gap-3 items-center overflow-x-auto pb-2 w-full md:w-auto custom-scrollbar">
            
            <button 
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
            )}
          </div>
        </div>`;

// We use regex to find the broken block, handling potential minor whitespace/diacritics differences
// Or better, just replace everything from <main className="flex-1... to </div></div> with the fixedBlock

const regex = /<main className="flex-1 h-screen overflow-y-auto custom-scrollbar p-6 md:p-8">[\s\S]*?PDF Ýndir[\s\S]*?<\/button>\s*<\/div>\s*<\/div>/g;

if (regex.test(content)) {
    content = content.replace(regex, fixedBlock);
    fs.writeFileSync("src/app/page.tsx", content, "utf-8");
    console.log("Fix applied!");
} else {
    // maybe diacritic is different
    const regex2 = /<main className="flex-1 h-screen overflow-y-auto custom-scrollbar p-6 md:p-8">[\s\S]*?<\/button>\s*<\/div>\s*<\/div>/;
    if (regex2.test(content)) {
        content = content.replace(regex2, fixedBlock);
        fs.writeFileSync("src/app/page.tsx", content, "utf-8");
        console.log("Fix applied! (regex2)");
    } else {
        console.log("Could not find the broken block.");
    }
}

