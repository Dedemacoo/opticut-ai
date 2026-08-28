
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf-8");

const modals = `
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Plan Yükseltme Gerekli</h3>
            <p className="text-slate-400 text-sm mb-6">{upgradeMessage}</p>
            
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Vazgeç
              </button>
              <button 
                onClick={() => {
                  setShowUpgradeModal(false);
                  router.push("/settings");
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                Planları İncele
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Fotoğraf Yükleme Modülü */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-500"></div>
            
            <button 
              onClick={() => {
                setShowAiModal(false);
                setAiImage(null);
                setAiPreview(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">OptiCut AI Asistan</h3>
                <p className="text-xs text-slate-400">Çizim veya el yazısı fotoğrafı yükleyin, yapay zeka analiz etsin.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {!aiPreview ? (
                <label className="border-2 border-dashed border-slate-700 hover:border-pink-500/50 bg-slate-800/50 hover:bg-slate-800 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors h-48">
                  <svg className="w-10 h-10 text-slate-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-sm font-medium text-slate-300">Fotoğraf seçmek için tıklayın</span>
                  <span className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP desteklenir</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAiImage(file);
                        setAiPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden bg-black/50 h-48 flex items-center justify-center group">
                  <img src={aiPreview} alt="Preview" className="max-h-full object-contain" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => { setAiImage(null); setAiPreview(null); }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
              )}
              
              <button 
                disabled={!aiImage || aiLoading}
                onClick={async () => {
                  if (!aiImage) return;
                  setAiLoading(true);
                  try {
                    const formData = new FormData();
                    formData.append("file", aiImage);
                    const res = await fetch("http://127.0.0.1:8000/api/ai-analyze", {
                      method: "POST",
                      body: formData,
                    });
                    
                    if (res.ok) {
                      const result = await res.json();
                      if (result.orders && Array.isArray(result.orders)) {
                         const newOrders = [...orders];
                         const filteredOrders = newOrders.filter(o => o.length > 0 && o.quantity > 0);
                         setOrders([...filteredOrders, ...result.orders]);
                         setShowAiModal(false);
                         setAiImage(null);
                         setAiPreview(null);
                         alert("AI analizi başarılı! Parçalar listeye eklendi.");
                      } else {
                        alert("AI modeli liste formatını anlayamadı.");
                      }
                    } else {
                       alert("AI sunucusu hata döndürdü.");
                    }
                  } catch (e) {
                    console.error(e);
                    alert("AI isteği başarısız.");
                  }
                  setAiLoading(false);
                }}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] px-5 py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Analiz Ediliyor...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Analiz Et ve Listeye Ekle
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace("{/* Özel CSS */}", modals + "\n      {/* Özel CSS */}");
fs.writeFileSync("src/app/page.tsx", content, "utf-8");

