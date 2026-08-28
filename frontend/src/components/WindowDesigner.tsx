"use client";

import { useState } from 'react';

type PaneType = 'fixed' | 'sash' | 'door';

type WindowDesignerProps = {
  onClose: () => void;
  onExport: (parts: { length: number; quantity: number }[]) => void;
};

export default function WindowDesigner({ onClose, onExport }: WindowDesignerProps) {
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(1500);
  const [verticalDivisions, setVerticalDivisions] = useState(2);
  const [horizontalDivisions, setHorizontalDivisions] = useState(2);
  const [frameThickness, setFrameThickness] = useState(60);
  
  // Yatay bolme pozisyonu: 0-100 arasi yuzde (ust kismin orani)
  const [hDividerPos, setHDividerPos] = useState(30);
  // Dikey bolme pozisyonu: 0-100 arasi yuzde (sol kismin orani)
  const [vDividerPos, setVDividerPos] = useState(50);
  
  const [paneTypes, setPaneTypes] = useState<Record<string, PaneType>>({});

  const cyclePane = (r: number, c: number) => {
    const key = `${r}-${c}`;
    const current = paneTypes[key] || 'fixed';
    const next: PaneType = current === 'fixed' ? 'sash' : current === 'sash' ? 'door' : 'fixed';
    setPaneTypes(prev => ({ ...prev, [key]: next }));
  };

  const getPaneType = (r: number, c: number): PaneType => {
    return paneTypes[`${r}-${c}`] || 'fixed';
  };

  // Satir yukseklik oranlari
  const getRowHeights = (): number[] => {
    if (horizontalDivisions === 1) return [100];
    if (horizontalDivisions === 2) return [hDividerPos, 100 - hDividerPos];
    const remaining = 100 - hDividerPos;
    const eachRemaining = remaining / (horizontalDivisions - 1);
    return [hDividerPos, ...Array(horizontalDivisions - 1).fill(eachRemaining)];
  };

  // Sutun genislik oranlari
  const getColWidths = (): number[] => {
    if (verticalDivisions === 1) return [100];
    if (verticalDivisions === 2) return [vDividerPos, 100 - vDividerPos];
    const remaining = 100 - vDividerPos;
    const eachRemaining = remaining / (verticalDivisions - 1);
    return [vDividerPos, ...Array(verticalDivisions - 1).fill(eachRemaining)];
  };

  // Gercek mm cinsinden
  const getRowHeightsMm = (): number[] => {
    const innerHeight = height - (frameThickness * 2);
    return getRowHeights().map(p => Math.round(innerHeight * p / 100));
  };

  const getColWidthsMm = (): number[] => {
    const innerWidth = width - (frameThickness * 2);
    return getColWidths().map(p => Math.round(innerWidth * p / 100));
  };

  const calculateParts = () => {
    const parts: { length: number; quantity: number }[] = [];
    const rowHeightsMm = getRowHeightsMm();
    const colWidthsMm = getColWidthsMm();
    
    // 1. Kasa Profilleri (Dis Cerceve) - 2 yatay, 2 dikey
    parts.push({ length: width, quantity: 2 });
    parts.push({ length: height, quantity: 2 });

    // 2. Dikey Kayitlar (Vertical Mullions)
    if (verticalDivisions > 1) {
      const mullionHeight = height - (frameThickness * 2);
      parts.push({ length: mullionHeight, quantity: verticalDivisions - 1 });
    }
    
    // 3. Yatay Kayitlar (Horizontal Mullions) - her sutun genisliginde
    if (horizontalDivisions > 1) {
      for (let c = 0; c < verticalDivisions; c++) {
        parts.push({ length: colWidthsMm[c], quantity: horizontalDivisions - 1 });
      }
    }

    // 4. Kanat ve Kapi Profilleri
    for (let r = 0; r < horizontalDivisions; r++) {
      for (let c = 0; c < verticalDivisions; c++) {
        const type = getPaneType(r, c);
        if (type === 'sash' || type === 'door') {
          const overlap = type === 'door' ? 50 : 40;
          const sashWidth = Math.round(colWidthsMm[c] + overlap);
          const sashHeight = Math.round(rowHeightsMm[r] + overlap);
          
          parts.push({ length: sashWidth, quantity: 2 });
          parts.push({ length: sashHeight, quantity: 2 });
        }
      }
    }

    onExport(parts);
  };

  // Kulp pozisyonu: ortaya yakin olan tarafa kulp koy
  const getHandleSide = (c: number): 'left' | 'right' => {
    const mid = (verticalDivisions - 1) / 2;
    if (c < mid) return 'right';  // Sol taraftaki kanat -> kulp saga (ice dogru)
    if (c > mid) return 'left';   // Sag taraftaki kanat -> kulp sola (ice dogru)
    // Tam ortadaysa (tek kanat) -> sag
    return 'right';
  };

  // Cizim boyutlari (piksel)
  const maxDrawSize = 360;
  const aspect = width / height;
  const drawW = aspect >= 1 ? maxDrawSize : Math.round(maxDrawSize * aspect);
  const drawH = aspect >= 1 ? Math.round(maxDrawSize / aspect) : maxDrawSize;
  const framePx = 10;
  const rowHeights = getRowHeights();
  const colWidths = getColWidths();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-700 w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Sol Panel - Ayarlar */}
        <div className="w-full md:w-[340px] bg-[#1e293b] p-6 border-r border-slate-700/50 overflow-y-auto custom-scrollbar flex-shrink-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
              iWindoor
            </h2>
            <button onClick={onClose} className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="space-y-4">
            
            {/* Adim 1 - Kasa Boyutlari */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                <span className="bg-blue-500/20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">1</span>
                Kasa Boyutlari
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Genislik (mm)</label>
                  <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Yukseklik (mm)</label>
                  <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Profil Kalinligi (mm)</label>
                <input type="number" value={frameThickness} onChange={(e) => setFrameThickness(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            
            {/* Adim 2 - Bolme */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                <span className="bg-emerald-500/20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">2</span>
                Kayit (Bolme)
              </h3>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">Dikey Bolme</label>
                  <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{verticalDivisions}</span>
                </div>
                <input type="range" min="1" max="5" value={verticalDivisions} onChange={(e) => setVerticalDivisions(Number(e.target.value))} className="w-full accent-emerald-500 h-2" />
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">Yatay Bolme</label>
                  <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{horizontalDivisions}</span>
                </div>
                <input type="range" min="1" max="4" value={horizontalDivisions} onChange={(e) => setHorizontalDivisions(Number(e.target.value))} className="w-full accent-emerald-500 h-2" />
              </div>

              {/* Yatay bolme pozisyonu - sadece 2+ yatay bolme varsa goster */}
              {horizontalDivisions >= 2 && (
                <div className="pt-3 border-t border-slate-700/50">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-300">Ust Kisim Orani</label>
                    <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">%{hDividerPos}</span>
                  </div>
                  <input type="range" min="15" max="85" value={hDividerPos} onChange={(e) => setHDividerPos(Number(e.target.value))} className="w-full accent-amber-500 h-2" />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Ust kucuk</span>
                    <span>Esit</span>
                    <span>Ust buyuk</span>
                  </div>
                </div>
              )}

              {/* Dikey bolme pozisyonu */}
              {verticalDivisions >= 2 && (
                <div className="pt-3 border-t border-slate-700/50">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-300">Sol Kisim Orani</label>
                    <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">%{vDividerPos}</span>
                  </div>
                  <input type="range" min="15" max="85" value={vDividerPos} onChange={(e) => setVDividerPos(Number(e.target.value))} className="w-full accent-amber-500 h-2" />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Sol kucuk</span>
                    <span>Esit</span>
                    <span>Sol buyuk</span>
                  </div>
                </div>
              )}
            </div>

            {/* Adim 3 - Kanat/Kapi */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                <span className="bg-purple-500/20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">3</span>
                Kanat / Kapi
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                Sagdaki cizimde bolmelere <b className="text-slate-200">TIKLAYARAK</b> donusturun. Her tiklamada sirayla degisir:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-slate-900/60 p-2 rounded-lg border border-slate-700/30">
                  <div className="w-7 h-7 rounded bg-sky-400/10 border-2 border-sky-400/30 flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 bg-sky-300/20 rounded-sm"></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-sky-400">Sabit Cam</p>
                    <p className="text-[10px] text-slate-500">Acilmaz panel</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/60 p-2 rounded-lg border border-slate-700/30">
                  <div className="w-7 h-7 rounded bg-emerald-400/10 border-2 border-emerald-400/50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-400">Acilir Kanat</p>
                    <p className="text-[10px] text-slate-500">Kulplar ortaya bakar</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/60 p-2 rounded-lg border border-slate-700/30">
                  <div className="w-7 h-7 rounded bg-amber-400/10 border-2 border-amber-400/50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-400">Kapi Kanadi</p>
                    <p className="text-[10px] text-slate-500">Cam + panel, kapi profili</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          <div className="mt-6">
            <button onClick={calculateParts} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex justify-center items-center gap-2 border border-emerald-500/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Ihtiyac Listesine Aktar
            </button>
          </div>
        </div>

        {/* Sag Panel - Cizim */}
        <div className="flex-1 p-8 flex flex-col justify-center items-center bg-[#0c1524] relative overflow-hidden">
          
          {/* Blueprint Grid */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>

          <div className="relative z-10 flex flex-col items-center">
            
            {/* Genislik */}
            <div className="flex items-center gap-2 mb-3" style={{ width: `${drawW}px` }}>
              <div className="h-px bg-blue-500/50 flex-1"></div>
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded whitespace-nowrap">{width} mm</span>
              <div className="h-px bg-blue-500/50 flex-1"></div>
            </div>

            <div className="flex items-start gap-3">
              {/* Yukseklik */}
              <div className="flex flex-col items-center" style={{ height: `${drawH}px` }}>
                <div className="w-px bg-blue-500/50 flex-1"></div>
                <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded my-1 whitespace-nowrap" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>{height} mm</span>
                <div className="w-px bg-blue-500/50 flex-1"></div>
              </div>

              {/* Pencere */}
              <div 
                className="relative shadow-2xl shadow-black/40"
                style={{ width: `${drawW}px`, height: `${drawH}px` }}
              >
                {/* Dis Kasa */}
                <div className="absolute inset-0 rounded-sm" style={{
                  background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 30%, #475569 70%, #334155 100%)',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.4), 0 0 30px rgba(0,0,0,0.3)'
                }}>
                  {/* Ic alan */}
                  <div 
                    className="absolute flex flex-col"
                    style={{ top: framePx, left: framePx, right: framePx, bottom: framePx, gap: '4px' }}
                  >
                    {Array.from({ length: horizontalDivisions }).map((_, r) => (
                      <div 
                        key={r} 
                        className="flex"
                        style={{ 
                          flex: `${rowHeights[r]} 0 0%`,
                          gap: '4px'
                        }}
                      >
                        {Array.from({ length: verticalDivisions }).map((_, c) => {
                          const type = getPaneType(r, c);
                          const handleSide = getHandleSide(c);
                          return (
                            <div 
                              key={c} 
                              onClick={() => cyclePane(r, c)}
                              className="relative cursor-pointer group transition-all duration-200"
                              style={{ flex: `${colWidths[c]} 0 0%` }}
                            >
                              {/* Sabit Cam */}
                              {type === 'fixed' && (
                                <div className="absolute inset-0 rounded-[2px] overflow-hidden group-hover:brightness-125 transition-all" style={{
                                  background: 'linear-gradient(135deg, rgba(186,230,253,0.3) 0%, rgba(125,211,252,0.15) 40%, rgba(56,189,248,0.1) 100%)',
                                  boxShadow: 'inset 0 0 20px rgba(56,189,248,0.1)'
                                }}>
                                  <div className="absolute top-2 left-2 w-1/3 h-1/2 bg-gradient-to-br from-white/15 to-transparent rounded-sm"></div>
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-bold text-sky-400 bg-sky-900/80 px-2 py-1 rounded backdrop-blur-sm">Tikla: Kanat</span>
                                  </div>
                                </div>
                              )}

                              {/* Acilir Kanat */}
                              {type === 'sash' && (
                                <div className="absolute inset-0 rounded-[2px] overflow-hidden group-hover:brightness-110 transition-all" style={{
                                  background: 'linear-gradient(135deg, rgba(110,231,183,0.15) 0%, rgba(52,211,153,0.08) 100%)',
                                }}>
                                  <div className="absolute inset-1 border-[3px] border-emerald-400/60 rounded-[1px]" style={{
                                    boxShadow: 'inset 0 0 8px rgba(52,211,153,0.15), 0 0 4px rgba(52,211,153,0.1)'
                                  }}>
                                    <div className="absolute top-1 left-1 w-1/3 h-1/2 bg-gradient-to-br from-emerald-300/15 to-transparent rounded-sm"></div>
                                    
                                    {/* Kulp - Pozisyon hesapla */}
                                    <div className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-6 bg-emerald-400/70 rounded-full shadow-lg ${handleSide === 'left' ? 'left-1' : 'right-1'}`}></div>
                                    
                                    {/* Acilma cizgileri - kulp tarafina gore ayarla */}
                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                      {handleSide === 'right' ? (
                                        <>
                                          <line x1="100" y1="0" x2="0" y2="50" stroke="rgba(52,211,153,0.3)" strokeWidth="0.8" />
                                          <line x1="0" y1="50" x2="100" y2="100" stroke="rgba(52,211,153,0.3)" strokeWidth="0.8" />
                                        </>
                                      ) : (
                                        <>
                                          <line x1="0" y1="0" x2="100" y2="50" stroke="rgba(52,211,153,0.3)" strokeWidth="0.8" />
                                          <line x1="100" y1="50" x2="0" y2="100" stroke="rgba(52,211,153,0.3)" strokeWidth="0.8" />
                                        </>
                                      )}
                                    </svg>
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/80 px-2 py-1 rounded backdrop-blur-sm">Tikla: Kapi</span>
                                  </div>
                                </div>
                              )}

                              {/* Kapi */}
                              {type === 'door' && (
                                <div className="absolute inset-0 rounded-[2px] overflow-hidden group-hover:brightness-110 transition-all" style={{
                                  background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.06) 100%)',
                                }}>
                                  <div className="absolute inset-1 border-[4px] border-amber-400/50 rounded-[1px]" style={{
                                    boxShadow: 'inset 0 0 8px rgba(245,158,11,0.1), 0 0 4px rgba(245,158,11,0.1)'
                                  }}>
                                    {/* Cam Alani (Ust) */}
                                    <div className="absolute top-1 left-1 right-1 bottom-[40%] bg-amber-300/5 border border-amber-400/20 rounded-sm">
                                      <div className="absolute top-1 left-1 w-1/3 h-1/2 bg-gradient-to-br from-amber-300/10 to-transparent rounded-sm"></div>
                                    </div>
                                    {/* Panel (Alt) */}
                                    <div className="absolute bottom-1 left-1 right-1 h-[35%] bg-amber-400/8 border border-amber-400/15 rounded-sm"></div>
                                    {/* Kulp */}
                                    <div className={`absolute top-[55%] -translate-y-1/2 w-1.5 h-8 bg-amber-400/70 rounded-full shadow-lg ${handleSide === 'left' ? 'left-2' : 'right-2'}`}></div>
                                    {/* Acilma yay cizgisi */}
                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                      {handleSide === 'right' ? (
                                        <path d="M 100 0 Q 0 50, 100 100" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="0.8" strokeDasharray="3,3" />
                                      ) : (
                                        <path d="M 0 0 Q 100 50, 0 100" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="0.8" strokeDasharray="3,3" />
                                      )}
                                    </svg>
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-bold text-amber-400 bg-amber-900/80 px-2 py-1 rounded backdrop-blur-sm">Tikla: Sabit</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Lejant */}
            <div className="mt-6 flex items-center gap-5 text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-slate-400 to-slate-600 shadow-inner"></div>
                Kasa
              </span>
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-sky-400/15 border border-sky-400/30"></div>
                Sabit
              </span>
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-400/15 border-2 border-emerald-400/50"></div>
                Kanat
              </span>
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-400/15 border-2 border-amber-400/50"></div>
                Kapi
              </span>
            </div>
          </div>
        </div>
        
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}} />
    </div>
  );
}
