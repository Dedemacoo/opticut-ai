"use client";

import { useState } from "react";

type DecorationDesignerProps = {
  onClose: () => void;
};

export default function DecorationDesigner({ onClose }: DecorationDesignerProps) {
  const [moduleType, setModuleType] = useState("Parke");
  const [area, setArea] = useState(20);
  const [length, setLength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [priceData, setPriceData] = useState<any>(null);
  const [projectName, setProjectName] = useState("Yeni Dekorasyon Projesi");
  const [isSaved, setIsSaved] = useState(false);

  const modules = ["Parke", "Supurgelik", "Fayans", "Alcipan", "Mutfak_Dolabi"];

  const handleEstimate = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://opticut-ai.onrender.com/api/ai-price-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_type: moduleType,
          area_sqm: area,
          linear_meters: length
        })
      });
      const data = await res.json();
      setPriceData(data);
    } catch (e) {
      console.error(e);
      alert("Yapay Zeka API hatasi");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      await fetch("https://opticut-ai.onrender.com/api/decoration/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          module_type: moduleType,
          area_sqm: area,
          linear_meters: length,
          estimated_price: priceData?.total_estimated_price || 0
        })
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      alert("Kaydedilemedi");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex flex-col backdrop-blur-sm print:static print:bg-white print:z-auto print:block">
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center print:p-0 print:block">
        <div className="bg-[#1e293b] print:bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-800 print:border-none print:shadow-none overflow-hidden flex flex-col md:flex-row">
          
          <div className="w-full md:w-1/3 bg-slate-900 print:hidden p-6 border-r border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Yapi & Dekorasyon</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Proje Adi</label>
                <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm outline-none" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Modul Tipi</label>
                <select value={moduleType} onChange={e => setModuleType(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm outline-none">
                  {modules.map(m => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
                </select>
              </div>

              {(moduleType === "Parke" || moduleType === "Fayans" || moduleType === "Alcipan") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Alan (m²)</label>
                  <input type="number" value={area} onChange={e => setArea(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm outline-none" />
                </div>
              )}

              {(moduleType === "Supurgelik" || moduleType === "Mutfak_Dolabi") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Uzunluk (Metretul)</label>
                  <input type="number" value={length} onChange={e => setLength(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm outline-none" />
                </div>
              )}

              <button 
                onClick={handleEstimate}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-lg text-sm transition shadow-lg shadow-blue-900/20"
              >
                {loading ? "Hesaplaniyor..." : "AI Fiyat Analizi"}
              </button>
            </div>
          </div>

          <div className="w-full md:w-2/3 p-6 md:p-10 relative bg-[#1e293b] print:bg-white print:text-black">
            {/* PRINT HEADER */}
            <div className="hidden print:flex justify-between items-end mb-8 pb-4 border-b-2 border-slate-200">
              <div>
                <h1 className="text-3xl font-black text-black">Dekorasyon Maliyet Raporu</h1>
                <h2 className="text-xl font-bold text-slate-700 mt-2">{projectName}</h2>
              </div>
              <div className="text-right flex flex-col items-end">
                <img src="/logo.png" alt="OptiCut Logo" className="h-10 mb-2 object-contain" />
                <p className="text-sm font-bold text-blue-600">OptiCut AI - Uretim Yonetimi</p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white print:hidden mb-6">Analiz Sonucu</h3>
            
            {priceData ? (
              <div className="bg-slate-800/50 print:bg-white border border-slate-700 print:border-slate-300 rounded-xl p-6">
                <div className="grid grid-cols-2 gap-4 mb-6 border-b border-slate-700 print:border-slate-300 pb-6">
                  <div>
                    <p className="text-sm text-slate-400 print:text-slate-600">Modul</p>
                    <p className="text-lg font-bold text-white print:text-black">{priceData.module_type.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 print:text-slate-600">Olcu</p>
                    <p className="text-lg font-bold text-white print:text-black">
                      {["Parke", "Fayans", "Alcipan"].includes(moduleType) ? area + " m²" : length + " mt"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-900 print:bg-slate-100 p-4 rounded-lg border border-slate-700 print:border-slate-300">
                  <p className="text-sm font-semibold text-slate-300 print:text-slate-700">Tahmini Toplam Maliyet:</p>
                  <p className="text-3xl font-black text-emerald-400 print:text-emerald-700">
                    {priceData.total_estimated_price.toLocaleString("tr-TR")} ₺
                  </p>
                </div>
                
                <p className="text-xs text-slate-500 mt-4 text-center italic">{priceData.note}</p>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 print:hidden border-2 border-dashed border-slate-700 rounded-xl">
                Lutfen sol menuden bilgileri girip "AI Fiyat Analizi" butonuna basin.
              </div>
            )}

            <div className="absolute top-6 right-6 flex gap-2 print:hidden">
              <button 
                onClick={handlePrint}
                disabled={!priceData}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition border border-slate-700 flex items-center gap-2"
              >
                PDF Indir
              </button>
              <button 
                onClick={handleSave}
                disabled={!priceData || isSaved}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-900/30 flex items-center gap-2"
              >
                {isSaved ? "Kaydedildi!" : "Projeyi Kaydet"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

