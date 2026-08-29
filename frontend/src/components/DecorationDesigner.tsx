"use client";

import { useState } from "react";

type DecorationDesignerProps = {
  onClose: () => void;
};

type ModuleConfig = {
  label: string;
  inputType: "area" | "linear" | "both";
  unit: string;
  materials: { name: string; unitPrice: number; wasteFactor: number }[];
  laborPerUnit: number;
};

const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  Parke: {
    label: "Parke",
    inputType: "area",
    unit: "m²",
    materials: [
      { name: "Lamine Parke (8mm)", unitPrice: 280, wasteFactor: 1.10 },
      { name: "Taban Kopugu (3mm)", unitPrice: 35, wasteFactor: 1.05 },
      { name: "Sunta / MDF Arma", unitPrice: 15, wasteFactor: 1.0 },
    ],
    laborPerUnit: 120,
  },
  Supurgelik: {
    label: "Supurgelik",
    inputType: "linear",
    unit: "mt",
    materials: [
      { name: "PVC Supurgelik (7cm)", unitPrice: 45, wasteFactor: 1.08 },
      { name: "Kose / Baslık Parcalari", unitPrice: 8, wasteFactor: 1.0 },
      { name: "Yapistiricı / Vida Seti", unitPrice: 5, wasteFactor: 1.0 },
    ],
    laborPerUnit: 35,
  },
  Fayans: {
    label: "Fayans",
    inputType: "area",
    unit: "m²",
    materials: [
      { name: "Seramik Fayans (30x60)", unitPrice: 320, wasteFactor: 1.12 },
      { name: "Yapistirici (25kg)", unitPrice: 18, wasteFactor: 1.0 },
      { name: "Derz Dolgusu", unitPrice: 12, wasteFactor: 1.0 },
      { name: "Fayans Artisi (%5)", unitPrice: 5, wasteFactor: 1.0 },
    ],
    laborPerUnit: 200,
  },
  Alcipan: {
    label: "Alcipan",
    inputType: "area",
    unit: "m²",
    materials: [
      { name: "Alcipan Levha (12.5mm)", unitPrice: 110, wasteFactor: 1.08 },
      { name: "Metal Profil (C/U)", unitPrice: 65, wasteFactor: 1.10 },
      { name: "Vida + Bant + Macun", unitPrice: 25, wasteFactor: 1.0 },
    ],
    laborPerUnit: 150,
  },
  Mutfak_Dolabi: {
    label: "Mutfak Dolabi",
    inputType: "linear",
    unit: "mt",
    materials: [
      { name: "Dolap Govdesi (Melamin)", unitPrice: 2800, wasteFactor: 1.0 },
      { name: "Kapak (Akrilik/Lake)", unitPrice: 1200, wasteFactor: 1.0 },
      { name: "Tezgah (Granit)", unitPrice: 950, wasteFactor: 1.05 },
      { name: "Mentese + Kol + Ray", unitPrice: 350, wasteFactor: 1.0 },
    ],
    laborPerUnit: 800,
  },
};

export default function DecorationDesigner({ onClose }: DecorationDesignerProps) {
  const [moduleType, setModuleType] = useState("Parke");
  const [area, setArea] = useState(20);
  const [length, setLength] = useState(10);
  const [roomWidth, setRoomWidth] = useState(4);
  const [roomLength, setRoomLength] = useState(5);
  const [ceilingHeight, setCeilingHeight] = useState(2.8);
  const [loading, setLoading] = useState(false);
  const [priceData, setPriceData] = useState<{
    breakdown: { name: string; quantity: string; unitPrice: number; totalPrice: number }[];
    laborCost: number;
    totalCost: number;
    moduleLabel: string;
    measure: string;
  } | null>(null);
  const [projectName, setProjectName] = useState("Yeni Dekorasyon Projesi");
  const [isSaved, setIsSaved] = useState(false);

  const modules = Object.keys(MODULE_CONFIGS);
  const config = MODULE_CONFIGS[moduleType];

  // Auto-calculate area from room dimensions
  const calcArea = (): number => {
    if (config.inputType === "area" || config.inputType === "both") return area;
    return 0;
  };
  const calcLinear = (): number => {
    if (config.inputType === "linear" || config.inputType === "both") return length;
    return 0;
  };

  const handleEstimate = () => {
    setLoading(true);
    setPriceData(null);

    setTimeout(() => {
      const qty = config.inputType === "linear" ? calcLinear() : calcArea();
      
      const breakdown = config.materials.map(mat => {
        const adjustedQty = qty * mat.wasteFactor;
        const total = Math.round(adjustedQty * mat.unitPrice);
        return {
          name: mat.name,
          quantity: `${adjustedQty.toFixed(1)} ${config.unit}`,
          unitPrice: mat.unitPrice,
          totalPrice: total,
        };
      });

      const laborCost = Math.round(qty * config.laborPerUnit);
      const materialTotal = breakdown.reduce((s, b) => s + b.totalPrice, 0);
      const totalCost = materialTotal + laborCost;

      setPriceData({
        breakdown,
        laborCost,
        totalCost,
        moduleLabel: config.label,
        measure: `${qty} ${config.unit}`,
      });
      setLoading(false);
    }, 1000);
  };

  const handleAutoCalcArea = () => {
    setArea(Math.round(roomWidth * roomLength * 10) / 10);
  };

  const handleAutoCalcPerimeter = () => {
    setLength(Math.round((roomWidth + roomLength) * 2 * 10) / 10);
  };

  const handleSave = async () => {
    try {
      await fetch("https://opticut-ai.onrender.com/api/decoration/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          module_type: moduleType,
          area_sqm: calcArea(),
          linear_meters: calcLinear(),
          estimated_price: priceData?.totalCost || 0
        })
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      alert("Kaydedilemedi");
    }
  };

  const handlePrint = () => {
    if (!priceData) return;
    const rows = priceData.breakdown.map(b =>
      `<tr><td style="padding:10px;border-bottom:1px solid #e2e8f0">${b.name}</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center">${b.quantity}</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right">${b.unitPrice.toLocaleString('tr-TR')} TL</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold">${b.totalPrice.toLocaleString('tr-TR')} TL</td></tr>`
    ).join('');
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>${projectName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { font-size: 22px; margin: 0; }
        .header h2 { font-size: 13px; color: #64748b; margin: 6px 0 0 0; }
        .logo { height: 36px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #1e293b; color: white; padding: 10px; text-align: left; }
        .total-row { background: #f0fdf4; }
        .total-box { margin-top: 20px; padding: 20px; background: #1e293b; color: white; border-radius: 12px; text-align: center; }
        .total-amount { font-size: 32px; font-weight: 900; color: #34d399; }
        .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
      </style></head><body>
      <div class="header">
        <div><h1>${projectName}</h1><h2>${priceData.moduleLabel} - ${priceData.measure} | ${new Date().toLocaleDateString('tr-TR')}</h2></div>
        <img src="/logo.png" alt="Logo" class="logo" onerror="this.style.display='none'" />
      </div>
      <table>
        <tr><th>Malzeme</th><th style="text-align:center">Miktar</th><th style="text-align:right">Birim Fiyat</th><th style="text-align:right">Toplam</th></tr>
        ${rows}
        <tr class="total-row"><td style="padding:10px;font-weight:bold" colspan="3">Iscilik</td><td style="padding:10px;text-align:right;font-weight:bold">${priceData.laborCost.toLocaleString('tr-TR')} TL</td></tr>
      </table>
      <div class="total-box">
        <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:2px;opacity:0.7">Toplam Maliyet</p>
        <p class="total-amount">${priceData.totalCost.toLocaleString('tr-TR')} TL</p>
      </div>
      <div class="footer">Bu rapor otomatik olarak olusturulmustur. | ${new Date().toLocaleString('tr-TR')}</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fadeInScale">
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-700 w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-fadeInUp">
        
        {/* Sol Panel */}
        <div className="w-full md:w-[360px] bg-[#1e293b] p-6 border-r border-slate-700/50 overflow-y-auto custom-scrollbar flex-shrink-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Yapi & Dekorasyon
            </h2>
            <button onClick={onClose} className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Proje Adi */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Proje Adi</label>
              <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm outline-none focus:ring-1 focus:ring-amber-500" />
            </div>

            {/* Modul Tipi */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                <span className="bg-amber-500/20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">1</span>
                Modul Secimi
              </h3>
              <select value={moduleType} onChange={e => { setModuleType(e.target.value); setPriceData(null); }} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm outline-none focus:ring-1 focus:ring-amber-500">
                {modules.map(m => <option key={m} value={m}>{MODULE_CONFIGS[m].label}</option>)}
              </select>
            </div>

            {/* Oda Boyutlari */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                <span className="bg-blue-500/20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">2</span>
                Oda Boyutlari
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">En (m)</label>
                  <input type="number" step="0.1" value={roomWidth} onChange={e => setRoomWidth(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Boy (m)</label>
                  <input type="number" step="0.1" value={roomLength} onChange={e => setRoomLength(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              {moduleType === "Alcipan" && (
                <div className="mb-3">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Tavan Yuksekligi (m)</label>
                  <input type="number" step="0.1" value={ceilingHeight} onChange={e => setCeilingHeight(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              )}
              <div className="flex gap-2">
                {config.inputType === "area" && (
                  <button onClick={handleAutoCalcArea} className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold py-2 px-3 rounded-lg transition border border-blue-500/30">
                    Taban Alani Hesapla ({(roomWidth * roomLength).toFixed(1)} m²)
                  </button>
                )}
                {config.inputType === "linear" && (
                  <button onClick={handleAutoCalcPerimeter} className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold py-2 px-3 rounded-lg transition border border-blue-500/30">
                    Cevre Hesapla ({((roomWidth + roomLength) * 2).toFixed(1)} mt)
                  </button>
                )}
              </div>
            </div>

            {/* Manuel Olcu */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                <span className="bg-emerald-500/20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">3</span>
                Olcu ({config.unit})
              </h3>
              {config.inputType === "area" ? (
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Toplam Alan (m²)</label>
                  <input type="number" step="0.1" value={area} onChange={e => setArea(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm outline-none focus:ring-1 focus:ring-emerald-500" />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Toplam Uzunluk (mt)</label>
                  <input type="number" step="0.1" value={length} onChange={e => setLength(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm outline-none focus:ring-1 focus:ring-emerald-500" />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2">
            <button onClick={handleEstimate} disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-900/30 transition-all flex justify-center items-center gap-2 border border-amber-400/30">
              {loading ? (
                <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Hesaplaniyor...</>
              ) : (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Fiyat Hesapla</>
              )}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handlePrint} disabled={!priceData} className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition-all flex justify-center items-center gap-2 border border-slate-600/50 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                PDF
              </button>
              <button onClick={handleSave} disabled={!priceData} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-900/30 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                {isSaved ? "Kaydedildi!" : "Kaydet"}
              </button>
            </div>
          </div>
        </div>

        {/* Sag Panel - Sonuc */}
        <div className="flex-1 p-8 bg-[#0c1524] relative overflow-y-auto">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>

          <div className="relative z-10">
            {priceData ? (
              <div className="animate-fadeInUp">
                <h3 className="text-lg font-bold text-white mb-1">{priceData.moduleLabel} Maliyet Analizi</h3>
                <p className="text-sm text-slate-400 mb-6">{priceData.measure} icin hesaplandi</p>

                {/* Material Breakdown */}
                <div className="space-y-2 mb-6">
                  {priceData.breakdown.map((b, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-800/60 p-3 rounded-lg border border-slate-700/30 animate-fadeInUp" style={{animationDelay: `${i * 100}ms`}}>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{b.name}</p>
                        <p className="text-[11px] text-slate-500">{b.quantity} x {b.unitPrice.toLocaleString('tr-TR')} TL/{config.unit}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-100">{b.totalPrice.toLocaleString('tr-TR')} TL</p>
                    </div>
                  ))}
                  {/* Labor */}
                  <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-lg border border-slate-700/30 animate-fadeInUp" style={{animationDelay: `${priceData.breakdown.length * 100}ms`}}>
                    <div>
                      <p className="text-sm font-medium text-slate-200">Iscilik</p>
                      <p className="text-[11px] text-slate-500">{config.laborPerUnit.toLocaleString('tr-TR')} TL/{config.unit}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-100">{priceData.laborCost.toLocaleString('tr-TR')} TL</p>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-xl text-center animate-fadeInScale" style={{animationDelay: '500ms'}}>
                  <p className="text-[11px] uppercase tracking-widest text-emerald-200/70 mb-1">Toplam Maliyet</p>
                  <p className="text-3xl font-black text-white">{priceData.totalCost.toLocaleString('tr-TR')} TL</p>
                </div>

                <p className="text-[10px] text-slate-500 mt-4 text-center">
                  Fire payi dahil hesaplanmistir. Gercek fiyatlar bolgeye gore degisebilir.
                </p>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                <svg className="w-16 h-16 text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                <p className="text-slate-500 text-sm mb-2">Henuz hesaplama yapilmadi</p>
                <p className="text-slate-600 text-xs">Sol panelden modul secin, olculeri girin ve<br/>"Fiyat Hesapla" butonuna basin.</p>
              </div>
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
