
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf-8");

const oldButton = `            <button 
              onClick={() => handleFeatureClick("AI Fotoğraf Yükleme ve OptiCut Copilot", "Pro Plus", () => { alert("AI Yükleme Modülü Açılıyor (Mock)") })}
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] border border-pink-500/50 px-4 md:px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 relative overflow-hidden group"
              title="Çizim fotoğrafı çekerek veya AI ile konuşarak liste oluşturun"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -translate-x-full skew-x-12"></div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              AI ile Oluştur
              {plan !== "Pro Plus" && <svg className="w-3.5 h-3.5 ml-1 opacity-70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
            </button>`;

const newButton = `            <button 
              onClick={() => handleFeatureClick("AI Fotoğraf Yükleme ve OptiCut Copilot", "Pro Plus", () => { alert("AI Yükleme Modülü Açılıyor (Mock)") })}
              className="relative overflow-hidden shadow-[0_0_20px_rgba(225,29,72,0.6)] hover:shadow-[0_0_25px_rgba(225,29,72,0.8)] border border-pink-500/30 px-5 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 group h-[44px]"
              title="Çizim fotoğrafı çekerek veya AI ile konuşarak liste oluşturun"
            >
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-screen scale-[1.2]"
              >
                <source src="/ai.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-900/60 to-rose-900/40 group-hover:from-pink-800/40 group-hover:to-rose-800/20 transition-all pointer-events-none z-0"></div>
              
              <span className="relative z-10 flex items-center gap-2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <svg className="w-5 h-5 animate-pulse text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                AI ile Oluştur
                {plan !== "Pro Plus" && <svg className="w-3.5 h-3.5 ml-1 opacity-90 text-pink-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
              </span>
            </button>`;

content = content.replace(oldButton, newButton);
fs.writeFileSync("src/app/page.tsx", content, "utf-8");

