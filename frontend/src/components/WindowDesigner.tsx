"use client";

import { useState, useEffect, useRef, Suspense, lazy } from "react";
import dynamic from "next/dynamic";

const Window3DViewer = dynamic(() => import("./Window3DViewer"), { 
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-900/50 rounded-xl"><div className="text-slate-500 text-sm animate-pulse">3D Yukleniyor...</div></div>
});

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

  const [projectName, setProjectName] = useState("Yeni Cizim");
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState<{company: string, name: string, email: string} | null>(null);

  // NEW: Profile Brand
  const [profileBrand, setProfileBrand] = useState("Rehau");
  const profileBrands = ["Rehau", "Veka", "KBE", "Kommerling", "Salamander", "Winsa", "Egepen", "Pilsa"];

  // NEW: Glass Type
  const [glassType, setGlassType] = useState("4+16+4 Isicam");
  const glassTypes = ["4mm Duz Cam", "4+12+4 Isicam", "4+16+4 Isicam", "4+16+4 Low-E", "6+16+6 Lamine", "4+12+4+12+4 Uclu"];

  // NEW: Accessory
  const [handleType, setHandleType] = useState("Standart Kol");
  const handleTypes = ["Standart Kol", "Kilitli Kol", "Cocuk Guvenlik Kolu", "Gizli Kol"];
  const [hingeType, setHingeType] = useState("Standart Mentese");
  const hingeTypes = ["Standart Mentese", "Gizli Mentese", "Agir Hizmet Mentese"];

  // NEW: Color
  const [profileColor, setProfileColor] = useState("Beyaz");
  const profileColors = ["Beyaz", "Antrasit Gri", "Altinmese", "Ceviz", "Siyah", "Mahogany"];

  // NEW: Insulation Calc
  const getUValue = (): number => {
    const glassU: Record<string, number> = {
      "4mm Duz Cam": 5.8, "4+12+4 Isicam": 2.8, "4+16+4 Isicam": 2.6,
      "4+16+4 Low-E": 1.1, "6+16+6 Lamine": 2.4, "4+12+4+12+4 Uclu": 0.7
    };
    return glassU[glassType] || 2.6;
  };
  const getSoundInsulation = (): number => {
    const soundDb: Record<string, number> = {
      "4mm Duz Cam": 25, "4+12+4 Isicam": 30, "4+16+4 Isicam": 32,
      "4+16+4 Low-E": 33, "6+16+6 Lamine": 38, "4+12+4+12+4 Uclu": 42
    };
    return soundDb[glassType] || 30;
  };

  // Print ref
  const printRef = useRef<HTMLDivElement>(null);

  // 3D View toggle
  const [view3D, setView3D] = useState(false);

  // Price calculation
  const [showPrice, setShowPrice] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState<{item: string, cost: number}[]>([]);

  const calculatePrice = () => {
    setPriceLoading(true);
    setShowPrice(false);
    setTimeout(() => {
      const area = (width / 1000) * (height / 1000); // m2
      const panelCount = verticalDivisions * horizontalDivisions;
      
      // Profile cost per meter (TL)
      const profileCostPerM: Record<string, number> = {
        "Rehau": 320, "Veka": 290, "KBE": 260, "Kommerling": 340,
        "Salamander": 310, "Winsa": 220, "Egepen": 200, "Pilsa": 190
      };
      const profilePerimeter = ((width + height) * 2) / 1000;
      const profileCost = Math.round(profilePerimeter * (profileCostPerM[profileBrand] || 250));

      // Glass cost per m2
      const glassCostPerM2: Record<string, number> = {
        "4mm Duz Cam": 180, "4+12+4 Isicam": 350, "4+16+4 Isicam": 420,
        "4+16+4 Low-E": 620, "6+16+6 Lamine": 750, "4+12+4+12+4 Uclu": 950
      };
      const glassCost = Math.round(area * (glassCostPerM2[glassType] || 400));

      // Color surcharge
      const colorSurcharge: Record<string, number> = {
        "Beyaz": 0, "Antrasit Gri": 350, "Altinmese": 280,
        "Ceviz": 300, "Siyah": 380, "Mahogany": 320
      };
      const colorCost = colorSurcharge[profileColor] || 0;

      // Accessories
      const handleCost: Record<string, number> = {
        "Standart Kol": 85, "Kilitli Kol": 150, "Cocuk Guvenlik Kolu": 220, "Gizli Kol": 300
      };
      const hingeCost: Record<string, number> = {
        "Standart Mentese": 60, "Gizli Mentese": 180, "Agir Hizmet Mentese": 250
      };
      const sashCount = Object.values(paneTypes).filter(t => t === 'sash' || t === 'door').length || 0;
      const accCost = sashCount * ((handleCost[handleType] || 85) + (hingeCost[hingeType] || 60));

      // Labor
      const laborCost = Math.round(area * 400);

      // Mullion cost
      const mullionCost = ((verticalDivisions - 1) + (horizontalDivisions - 1)) * 120;

      const breakdown = [
        { item: `Profil (${profileBrand})`, cost: profileCost },
        { item: `Cam (${glassType})`, cost: glassCost },
        { item: `Renk Farki (${profileColor})`, cost: colorCost },
        { item: `Aksesuar (${sashCount} kanat)`, cost: accCost },
        { item: "Kayit Profilleri", cost: mullionCost },
        { item: "Iscilik", cost: laborCost },
      ].filter(b => b.cost > 0);

      const total = breakdown.reduce((sum, b) => sum + b.cost, 0);
      setPriceBreakdown(breakdown);
      setTotalPrice(total);
      setPriceLoading(false);
      setShowPrice(true);
    }, 1200);
  };

  useEffect(() => {
    const t = localStorage.getItem("opticut_token");
    if(t) {
      try { setUser(JSON.parse(t)); } catch(e){}
    }
  }, []);

  const handlePrint = () => {
    const priceRows = priceBreakdown.map(b => 
      `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">${b.item}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold">${b.cost.toLocaleString('tr-TR')} TL</td></tr>`
    ).join('');
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>${projectName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { font-size: 24px; color: #0f172a; margin: 0; }
        .header h2 { font-size: 14px; color: #64748b; margin: 6px 0 0 0; }
        .logo { height: 40px; }
        .specs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .spec-item { background: #f1f5f9; padding: 12px; border-radius: 8px; }
        .spec-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
        .spec-value { font-size: 15px; font-weight: bold; color: #0f172a; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #1e293b; color: white; padding: 10px; text-align: left; }
        td { padding: 10px; }
        .insulation { margin-top: 20px; padding: 15px; background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 8px; }
        .total { margin-top: 20px; padding: 20px; background: #1e293b; color: white; border-radius: 12px; text-align: center; }
        .total-amount { font-size: 32px; font-weight: 900; color: #34d399; }
        .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
      </style></head><body>
      <div class="header">
        <div><h1>${projectName}</h1><h2>${new Date().toLocaleDateString('tr-TR')} tarihli cizim raporu</h2></div>
        <img src="/logo.png" alt="Logo" class="logo" onerror="this.style.display='none'" />
      </div>
      <div class="specs">
        <div class="spec-item"><div class="spec-label">Genislik</div><div class="spec-value">${width} mm</div></div>
        <div class="spec-item"><div class="spec-label">Yukseklik</div><div class="spec-value">${height} mm</div></div>
        <div class="spec-item"><div class="spec-label">Profil Markasi</div><div class="spec-value">${profileBrand}</div></div>
        <div class="spec-item"><div class="spec-label">Cam Tipi</div><div class="spec-value">${glassType}</div></div>
        <div class="spec-item"><div class="spec-label">Profil Rengi</div><div class="spec-value">${profileColor}</div></div>
        <div class="spec-item"><div class="spec-label">Kol / Mentese</div><div class="spec-value">${handleType} / ${hingeType}</div></div>
        <div class="spec-item"><div class="spec-label">Bolmeler</div><div class="spec-value">${verticalDivisions} Dikey x ${horizontalDivisions} Yatay</div></div>
        <div class="spec-item"><div class="spec-label">Profil Kalinligi</div><div class="spec-value">${frameThickness} mm</div></div>
      </div>
      <div class="insulation">
        <strong>Yalitim:</strong> U-Degeri: ${getUValue()} W/m²K | Ses: ${getSoundInsulation()} dB
      </div>
      ${showPrice ? `
        <table>
          <tr><th>Kalem</th><th style="text-align:right">Tutar</th></tr>
          ${priceRows}
        </table>
        <div class="total">
          <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:2px;opacity:0.7">Toplam Maliyet</p>
          <p class="total-amount">${totalPrice.toLocaleString('tr-TR')} TL</p>
        </div>
      ` : ''}
      <div class="footer">Bu rapor otomatik olarak olusturulmustur. | ${new Date().toLocaleString('tr-TR')}</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };
  
  const handleSave = async () => {
    try {
      await fetch("https://opticut-ai.onrender.com/api/iwindoor/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          design_data: JSON.stringify({ width, height, verticalDivisions, horizontalDivisions, paneTypes, profileBrand, glassType, profileColor, handleType, hingeType }),
          total_price: totalPrice || 0
        })
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch(e) {}
  };



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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fadeInScale">
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-700 w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-fadeInUp">
        
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

            {/* Adim 4 - Profil & Cam */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="bg-cyan-500/20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">4</span>
                Profil & Cam
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Profil Markasi</label>
                  <select value={profileBrand} onChange={e => setProfileBrand(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm outline-none focus:ring-1 focus:ring-cyan-500">
                    {profileBrands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Cam Tipi</label>
                  <select value={glassType} onChange={e => setGlassType(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm outline-none focus:ring-1 focus:ring-cyan-500">
                    {glassTypes.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Profil Rengi</label>
                  <select value={profileColor} onChange={e => setProfileColor(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm outline-none focus:ring-1 focus:ring-cyan-500">
                    {profileColors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Adim 5 - Aksesuar */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2">
                <span className="bg-rose-500/20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">5</span>
                Aksesuar
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Kol Tipi</label>
                  <select value={handleType} onChange={e => setHandleType(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm outline-none focus:ring-1 focus:ring-rose-500">
                    {handleTypes.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Mentese Tipi</label>
                  <select value={hingeType} onChange={e => setHingeType(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm outline-none focus:ring-1 focus:ring-rose-500">
                    {hingeTypes.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Adim 6 - Yalitim Bilgisi */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-bold text-teal-400 mb-3 flex items-center gap-2">
                <span className="bg-teal-500/20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">6</span>
                Yalitim Degerleri
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/30 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Isi (U-Degeri)</p>
                  <p className="text-lg font-black text-teal-400">{getUValue()}</p>
                  <p className="text-[10px] text-slate-500">W/m²K</p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/30 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Ses Yalitimi</p>
                  <p className="text-lg font-black text-teal-400">{getSoundInsulation()}</p>
                  <p className="text-[10px] text-slate-500">dB</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                {getUValue() <= 1.3 ? "Mukemmel yalitim! Enerji tasarrufunda ust seviye." :
                 getUValue() <= 2.0 ? "Iyi yalitim. Standart konutlar icin uygun." :
                 "Temel yalitim. Daha iyi cam secimi onerilir."}
              </p>
            </div>

            {/* Proje Adi */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Proje Adi</label>
              <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>

          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 space-y-2">
            <button onClick={calculateParts} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex justify-center items-center gap-2 border border-emerald-500/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Kesim Listesine Aktar
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handlePrint} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition-all flex justify-center items-center gap-2 border border-slate-600/50 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                PDF Indir
              </button>
              <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-900/30 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                {isSaved ? "Kaydedildi!" : "Projeyi Kaydet"}
              </button>
            </div>

            {/* Fiyat Hesapla Button */}
            <button onClick={calculatePrice} disabled={priceLoading} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-900/30 transition-all flex justify-center items-center gap-2 border border-amber-400/30">
              {priceLoading ? (
                <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Hesaplaniyor...</>
              ) : (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Fiyat Hesapla</>
              )}
            </button>

            {/* Price Breakdown */}
            {showPrice && (
              <div className="animate-fadeInUp bg-slate-800/80 rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="p-3 space-y-1.5">
                  {priceBreakdown.map((b, i) => (
                    <div key={i} className="flex justify-between items-center animate-fadeInUp" style={{animationDelay: `${i * 80}ms`}}>
                      <span className="text-xs text-slate-400">{b.item}</span>
                      <span className="text-xs font-bold text-slate-200">{b.cost.toLocaleString('tr-TR')} TL</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-center animate-fadeInScale" style={{animationDelay: '400ms'}}>
                  <p className="text-[10px] uppercase tracking-widest text-emerald-200/70 mb-1">Toplam Maliyet</p>
                  <p className="text-2xl font-black text-white">{totalPrice.toLocaleString('tr-TR')} TL</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sag Panel - Cizim */}
        <div ref={printRef} className="flex-1 p-8 flex flex-col justify-center items-center bg-[#0c1524] relative overflow-hidden">
          
          {/* Blueprint Grid */}
          <div className="absolute inset-0 opacity-10 print:hidden" style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>

          {/* 3D Toggle Button */}
          <div className="absolute top-4 right-4 z-20 print:hidden bg-slate-900/80 backdrop-blur p-1 rounded-lg border border-slate-700/50 flex shadow-lg">
            <button onClick={() => setView3D(false)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!view3D ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>2D Cizim</button>
            <button onClick={() => setView3D(true)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${view3D ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
              3D Gorunum
            </button>
          </div>

          <div className="relative z-10 flex flex-col items-center w-full h-full justify-center">
            
            {view3D ? (
              <div className="w-full h-full flex-1 flex flex-col min-h-[400px]">
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="text-amber-500 animate-pulse font-bold text-lg">3D Motoru Baslatiliyor...</div></div>}>
                  <Window3DViewer 
                    width={width}
                    height={height}
                    verticalDivisions={verticalDivisions}
                    horizontalDivisions={horizontalDivisions}
                    frameThickness={frameThickness}
                    paneTypes={paneTypes}
                    hDividerPos={hDividerPos}
                    vDividerPos={vDividerPos}
                    profileColor={profileColor}
                  />
                </Suspense>
              </div>
            ) : (
              <>
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
            </>
            )}
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
