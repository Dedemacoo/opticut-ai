import { useState, useRef, useEffect } from "react";

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
  
  const [hDividerPos, setHDividerPos] = useState(30);
  const [vDividerPos, setVDividerPos] = useState(50);
  const [projectName, setProjectName] = useState("Yeni Cizim");
  const [isSaved, setIsSaved] = useState(false);
  
  const [user, setUser] = useState<{company: string, name: string, email: string} | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("opticut_token");
    if(t) {
      try { setUser(JSON.parse(t)); } catch(e){}
    }
  }, []);

  const calculateParts = () => {
    const parts: { length: number; quantity: number }[] = [];
    parts.push({ length: width, quantity: 2 });
    parts.push({ length: height, quantity: 2 });
    if (verticalDivisions > 1) {
      const vLength = height - (frameThickness * 2);
      parts.push({ length: vLength, quantity: verticalDivisions - 1 });
    }
    if (horizontalDivisions > 1) {
      const hLength = width - (frameThickness * 2);
      parts.push({ length: hLength, quantity: horizontalDivisions - 1 });
    }
    return parts;
  };

  const handleExportClick = () => {
    onExport(calculateParts());
    onClose();
  };
  
  const handlePrint = () => window.print();
  
  const handleSave = async () => {
    try {
      await fetch("https://opticut-ai.onrender.com/api/iwindoor/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          design_data: JSON.stringify({ width, height, verticalDivisions, horizontalDivisions }),
          total_price: 1500 // mock price
        })
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch(e) {}
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex flex-col backdrop-blur-sm print:static print:bg-white print:block">
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center print:p-0 print:block">
        <div className="bg-[#1e293b] print:bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-800 print:border-none print:shadow-none overflow-hidden flex flex-col md:flex-row">
          
          <div className="w-full md:w-1/3 bg-slate-900 print:hidden p-6 border-r border-slate-800 overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                iWindoor 2D
              </h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Proje Adi</label>
                <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Ana Olculer (mm)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-500 block mb-1">Genislik</span>
                    <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full bg-transparent text-white font-bold outline-none" />
                  </div>
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-500 block mb-1">Yukseklik</span>
                    <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full bg-transparent text-white font-bold outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Bolmeler</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-500 block mb-1">Dikey Sutun</span>
                    <input type="number" min="1" max="4" value={verticalDivisions} onChange={(e) => setVerticalDivisions(Number(e.target.value))} className="w-full bg-transparent text-white font-bold outline-none" />
                  </div>
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-500 block mb-1">Yatay Satir</span>
                    <input type="number" min="1" max="4" value={horizontalDivisions} onChange={(e) => setHorizontalDivisions(Number(e.target.value))} className="w-full bg-transparent text-white font-bold outline-none" />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleExportClick}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-900/30 flex justify-center items-center gap-2 mt-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Kesim Listesine Aktar
              </button>
            </div>
          </div>

          <div className="w-full md:w-2/3 p-6 md:p-10 relative bg-[#0f172a] print:bg-white flex flex-col items-center justify-center min-h-[500px]">
            {/* PRINT HEADER */}
            <div className="hidden print:flex w-full justify-between items-end mb-8 pb-4 border-b-2 border-slate-200">
              <div>
                <h1 className="text-3xl font-black text-black">iWindoor Tasarimi</h1>
                <h2 className="text-xl font-bold text-slate-700 mt-2">{projectName}</h2>
              </div>
              <div className="text-right flex flex-col items-end">
                <img src="/logo.png" alt="OptiCut Logo" className="h-10 mb-2 object-contain" />
                <p className="text-sm font-bold text-blue-600">OptiCut AI - Uretim Yonetimi</p>
              </div>
            </div>

            <div className="absolute top-6 right-6 flex gap-2 print:hidden z-10">
              <button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition border border-slate-700">
                PDF
              </button>
              <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-900/30">
                {isSaved ? "Kaydedildi" : "Projeyi Kaydet"}
              </button>
            </div>
            
            <div className="relative border-4 border-white print:border-black bg-slate-800/50 print:bg-transparent shadow-2xl transition-all" style={{ width: `${Math.min(width / 3, 300)}px`, height: `${Math.min(height / 3, 400)}px` }}>
              {/* Cizim detaylari (yatay/dikey cizgiler mock) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 text-white print:text-black">
                Pencere Tasarimi ({width}x{height})
              </div>
            </div>
            
            <div className="mt-8 text-center print:text-black">
              <h3 className="text-white print:text-black font-bold mb-2">Gerekli Parcalar</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {calculateParts().map((p, i) => (
                  <span key={i} className="bg-slate-800 print:bg-slate-200 text-slate-300 print:text-black px-3 py-1 rounded-full text-xs border border-slate-700 print:border-slate-400">
                    {p.length}mm x {p.quantity} Adet
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

