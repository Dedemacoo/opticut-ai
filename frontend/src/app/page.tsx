"use client";

import { API_BASE_URL } from "@/config";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from "react";
import WindowDesigner from "@/components/WindowDesigner";
import DecorationDesigner from "@/components/DecorationDesigner";
import { usePlan } from "@/context/PlanContext";
import { Suspense } from "react";

function HomeContent() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const { plan } = usePlan();
  
  // User Data State
  const [user, setUser] = useState<{name: string, email: string, company: string, plan: string} | null>(null);

  useEffect(() => {
    const storedUserStr = localStorage.getItem("opticut_token");
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        if (typeof storedUser === "object") {
          setUser(storedUser);
        }
      } catch (e) {}
    }
  }, []);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: "user" | "ai", text: string, image?: string}[]>([
    { role: "ai", text: "Merhaba! Ben OptiCut Copilot. Bana keseceğin parçaların bir fotoğrafını gönderebilir veya listeni yazabilirsin. Senin için anında tabloya eklerim!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatAttachment, setChatAttachment] = useState<File | null>(null);
  const [chatAttachmentPreview, setChatAttachmentPreview] = useState<string | null>(null);
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [upgradeTargetPlan, setUpgradeTargetPlan] = useState("");

  const handleFeatureClick = (feature: string, requiredPlan: string, action: () => void) => {
    const plans = ["Standart", "Pro", "Pro Plus"];
    const currentIdx = plans.indexOf(plan);
    const requiredIdx = plans.indexOf(requiredPlan);

    if (currentIdx >= requiredIdx) {
      action();
    } else {
      setUpgradeMessage(`"${feature}" özelliğini kullanmak için planınızı yükseltmeniz gerekmektedir.`);
      setUpgradeTargetPlan(requiredPlan);
      setShowUpgradeModal(true);
    }
  };
  const [stockLength, setStockLength] = useState<number>(6000);
  const [kerf, setKerf] = useState<number>(3);
  
  const [orders, setOrders] = useState([{ length: 1400, quantity: 66 }, { length: 2000, quantity: 24 }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [showDesigner, setShowDesigner] = useState(false);
  const [showDecoration, setShowDecoration] = useState(false);
  const [useScrap, setUseScrap] = useState(false);
  const [scrapLengths, setScrapLengths] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sayfa yüklendiğinde geçmiş projeleri çek
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/`);
      const data = await res.json();
      setProjects(data);
    } catch (e) {
      console.error("Projeler yüklenemedi", e);
    }
  };

  const loadProjectResult = async (id: number) => {
    setActiveProject(id);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}/result`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        setResult(null);
        alert("Bu projenin henüz optimizasyon sonucu yok.");
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const startNewProject = () => {
    setActiveProject(null);
    setResult(null);
    setOrders([{ length: 1400, quantity: 66 }]);
  };

  const handleAddOrder = () => {
    setOrders([...orders, { length: 0, quantity: 0 }]);
  };

  const handleUpdateOrder = (index: number, field: string, value: number) => {
    const newOrders = [...orders];
    newOrders[index] = { ...newOrders[index], [field]: value };
    setOrders(newOrders);
  };

  const handleRemoveOrder = (index: number) => {
    const newOrders = orders.filter((_, i) => i !== index);
    setOrders(newOrders);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { read, utils } = await import("xlsx");
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = utils.sheet_to_json(firstSheet);
      
      const newOrders = [...orders]; // Mevcut listeyi koru
      let eklendi = 0;
      
      jsonData.forEach((row) => {
        // Excel'de "Boy" ve "Adet" sütunları olmalı (büyük/küçük harf toleranslı)
        const lengthKey = Object.keys(row).find(k => k.toLowerCase().includes('boy') || k.toLowerCase().includes('uzunluk') || k.toLowerCase().includes('length'));
        const qtyKey = Object.keys(row).find(k => k.toLowerCase().includes('adet') || k.toLowerCase().includes('miktar') || k.toLowerCase().includes('qty') || k.toLowerCase().includes('quantity'));
        
        if (lengthKey && qtyKey) {
          const l = Number(row[lengthKey]);
          const q = Number(row[qtyKey]);
          if (l > 0 && q > 0) {
            newOrders.push({ length: l, quantity: q });
            eklendi++;
          }
        }
      });
      
      // Eğer listede en baştaki boş (0, 0) satırı duruyorsa onu temizle
      const filteredOrders = newOrders.filter(o => o.length > 0 && o.quantity > 0);
      setOrders(filteredOrders.length > 0 ? filteredOrders : newOrders);
      
      if (eklendi > 0) {
        alert(`${eklendi} parça Excel'den başarıyla aktarıldı!`);
      } else {
        alert("Excel dosyasında geçerli bir parça bulunamadı. Lütfen 'Boy' ve 'Adet' sütun başlıklarını kontrol edin.");
      }
    } catch (error) {
      console.error("Excel okuma hatası:", error);
      alert("Excel dosyası okunamadı.");
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  
  const handleExportExcel = async () => {
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

    writeFile(wb, `OptiCut_Rapor_${new Date().getTime()}.xlsx`);
  };

  const handleExportPdf = () => {
    window.print();
  };

  const optimize = async () => {
    setLoading(true);
    setResult(null);
    try {
      // 1. Önce proje oluştur
      const projRes = await fetch(`${API_BASE_URL}/projects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Sipariş #" + Math.floor(Math.random() * 1000) }),
      });
      const project = await projRes.json();
      
      // 2. Siparişleri ekle
      for (const order of orders) {
        if (order.length > 0 && order.quantity > 0) {
          await fetch(`${API_BASE_URL}/projects/${project.id}/orders/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order),
          });
        }
      }

      // 3. Optimizasyonu çalıştır
      const optRes = await fetch(`${API_BASE_URL}/projects/${project.id}/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: project.id, stock_length: stockLength, kerf: kerf }),
      });
      
      const optData = await optRes.json();
      setResult(optData);
      
      // Geçmiş projeler listesini yenile
      fetchProjects();
      setActiveProject(project.id);

    } catch (error) {
      console.error("Optimizasyon Hatası:", error);
      alert("Sunucuya bağlanılamadı.");
    }
    setLoading(false);
  };

  return (
    <>
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar p-6 md:p-8">
        
        {/* Navbar for Mobile / Quick Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-slate-800 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">{activeProject ? "Geçmiş Proje Sonucu" : "Yeni Üretim Planı"}</h2>
            <p className="text-slate-500 text-sm mt-1">{activeProject ? "Sistemden yüklenen eski bir hesaplama." : "En az malzemeyle maksimum verimlilik."}</p>
          </div>
          
          <div className="flex gap-2 md:gap-3 items-center overflow-x-auto pb-2 w-full md:w-auto custom-scrollbar">
            
            <button 
              onClick={() => handleFeatureClick("AI Fotoğraf Yükleme ve OptiCut Copilot", "Pro Plus", () => setShowAiModal(true))}
              className="relative overflow-hidden shadow-[0_0_20px_rgba(225,29,72,0.6)] hover:shadow-[0_0_25px_rgba(225,29,72,0.8)] border border-pink-500/30 px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap flex-shrink-0 group h-[38px]"
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
            </button>

            <button 
              onClick={() => handleFeatureClick("iWindoor 2D Çizim Modülü", "Pro", () => setShowDesigner(true))}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-900/20 border border-indigo-500/50 px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 h-[38px]"
              title="Görsel olarak pencere/kapı tasarlayın"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
              iWindoor 2D
              {plan === "Standart" && <svg className="w-3.5 h-3.5 ml-1 opacity-70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
            </button>
            
            <button 
              onClick={() => handleFeatureClick("Yapi & Dekorasyon", "Pro Plus", () => setShowDecoration(true))}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-orange-900/20 border border-orange-500/50 px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 h-[38px]"
              title="Yapi & Dekorasyon Modulu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Yapi & Dekorasyon
              {plan !== "Pro Plus" && <svg className="w-3.5 h-3.5 ml-1 opacity-70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
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
                Excel ile İçeri Aktar
            </button>
            
            {activeProject && (
              <>
                <button 
                  onClick={handleExportExcel}
                  className="print:hidden bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                  Excel ile Dışa Aktar
                </button>
                <button 
                  onClick={handleExportPdf}
                  className="print:hidden bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  PDF İndir
                </button>
              </>
            )}
          </div>
        </div>

        
          {/* SADECE PDF/YAZDIRMA EKRANINDA GORUNECEK OLAN KURUMSAL HEADER */}
          <div className="hidden print:flex justify-between items-end mb-8 pb-4 border-b-2 border-slate-800">
            <div>
              <h1 className="text-3xl font-black text-black">Kesim Raporu</h1>
              <h2 className="text-xl font-bold text-slate-700 mt-2">{user?.company || "OptiCut Kullanıcısı"}</h2>
              <p className="text-slate-500 font-medium">{user?.name} ({user?.email})</p>
              <p suppressHydrationWarning className="text-slate-500 text-sm mt-1">Tarih: {new Date().toLocaleString("tr-TR")}</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <img src="/logo.png" alt="OptiCut Logo" className="h-10 mb-2 object-contain" />
              <p className="text-sm font-bold text-blue-600">OptiCut AI - Üretim Yönetimi</p>
              <p className="text-xs text-slate-500">www.opticut.com</p>
            </div>
          </div>
          {!activeProject && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8 animate-in fade-in slide-in-from-top-4">
            
            {/* Sol Panel - Veri Girişi */}
            <div className="xl:col-span-4 space-y-6">
              
              {/* Stok Ayarları */}
              <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl border border-slate-700/50">
                <h2 className="text-sm font-semibold mb-5 text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                  1. Stok ve Ayarlar
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Stok Boyu (mm)</label>
                    <input type="number" value={stockLength} onChange={(e) => setStockLength(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500/50 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Kerf (mm)</label>
                    <input type="number" value={kerf} onChange={(e) => setKerf(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500/50 outline-none" />
                  </div>
                </div>
                
                {/* Fire Toggle */}
                <div className="mt-5 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-300">Depodaki Fireleri Kullan</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Eski artik parcalari hesaba kat</p>
                    </div>
                    <button 
                      onClick={() => setUseScrap(!useScrap)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${useScrap ? 'bg-emerald-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${useScrap ? 'translate-x-[22px]' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>
                  {useScrap && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-[11px] text-slate-400 mb-1">Artik boylarini virgul ile girin (mm)</label>
                      <input 
                        type="text" 
                        placeholder="Orn: 2400, 1800, 3200" 
                        value={scrapLengths} 
                        onChange={(e) => setScrapLengths(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-emerald-700/50 rounded-lg text-sm text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Kesilecek Parçalar */}
              <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
                    2. İhtiyaç Listesi
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={handleAddOrder} className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 text-blue-400 px-3 py-1.5 rounded-lg transition-colors font-medium">
                      + Ekle
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {orders.map((order, idx) => (
                    <div key={idx} className="flex gap-3 items-center group">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">L</span>
                        <input type="number" placeholder="Boy" value={order.length || ""} onChange={(e) => handleUpdateOrder(idx, "length", Number(e.target.value))} className="w-full pl-8 p-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-200" />
                      </div>
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">Q</span>
                        <input type="number" placeholder="Adet" value={order.quantity || ""} onChange={(e) => handleUpdateOrder(idx, "quantity", Number(e.target.value))} className="w-full pl-8 p-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-200" />
                      </div>
                      <button onClick={() => handleRemoveOrder(idx)} className="text-slate-500 hover:text-red-400 p-2 opacity-50 group-hover:opacity-100 transition-all rounded hover:bg-red-400/10">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={optimize} 
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 border border-blue-500/50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>Yapay Zeka Hesaplanıyor...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      <span>3. Optimizasyonu Başlat</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Ortadaki Sonuç Ekranı */}
            <div className="xl:col-span-8 flex flex-col justify-center">
              {!result && !loading && (
                <div className="h-full min-h-[400px] bg-slate-800/30 rounded-3xl flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-700/50">
                  <div className="p-5 bg-slate-800/50 rounded-full mb-4">
                    <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-300">Girdileri Bekliyor</h3>
                  <p className="text-sm text-slate-500 max-w-sm text-center mt-2">
                    Kesilecek parçaları listeye ekleyin ve optimizasyonu başlatın.
                  </p>
                </div>
              )}
              {loading && (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-blue-400">
                   <svg className="animate-spin h-12 w-12 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   <p className="font-medium animate-pulse">Algoritma en iyi kombinasyonu arıyor...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sonuçlar */}
        {result && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Anlık Tasarruf Metriği */}
            <div className="bg-gradient-to-r from-emerald-900/40 via-emerald-800/20 to-teal-900/40 p-5 rounded-2xl border border-emerald-700/30 shadow-lg shadow-emerald-900/10 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/15 rounded-xl border border-emerald-500/20">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Opticut Akilli Tasarruf</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Geleneksel yonteme kiyasla</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-black text-emerald-400">
                      %{Math.max(0, (100 - result.waste_percentage) - 80).toFixed(1)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Ekstra Verimlilik</p>
                  </div>
                  <div className="w-px bg-emerald-700/30"></div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-teal-400">
                      {Math.max(0, Math.ceil(orders.reduce((s, o) => s + o.length * o.quantity, 0) / stockLength) - result.total_stock_used)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Kurtarilan Profil</p>
                  </div>
                  <div className="w-px bg-emerald-700/30"></div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-sky-400">
                      {((1 - result.waste_percentage / 100) * 100).toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Malzeme Verimi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#1e293b] p-5 rounded-2xl shadow-lg border border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kullanilan Stok</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-100">{result.total_stock_used}</span>
                  <span className="text-xs font-medium text-slate-500">adet</span>
                </div>
              </div>
              <div className="bg-[#1e293b] p-5 rounded-2xl shadow-lg border border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fire Orani</span>
                <div className="mt-2">
                  <span className={`text-3xl font-black ${result.waste_percentage < 5 ? 'text-emerald-400' : result.waste_percentage < 10 ? 'text-amber-400' : 'text-red-400'}`}>%{result.waste_percentage.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-[#1e293b] p-5 rounded-2xl shadow-lg border border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toplam Fire</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-orange-400">{(result.total_waste / 1000).toFixed(2)}</span>
                  <span className="text-xs font-medium text-slate-500">metre</span>
                </div>
              </div>
              <div className="bg-[#1e293b] p-5 rounded-2xl shadow-lg border border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toplam Kesim</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-blue-400">{result.patterns.reduce((s: number, p: any) => s + p.cuts.length * p.usage_count, 0)}</span>
                  <span className="text-xs font-medium text-slate-500">parca</span>
                </div>
              </div>
            </div>

            {/* Görsel Kesim Haritası */}
            <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-slate-700/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Görsel Kesim Haritası
                </h2>
                <div className="flex items-center gap-4 text-[11px] font-semibold">
                  <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gradient-to-r from-emerald-500 to-green-500"></div> Net Parca</span>
                  <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gradient-to-r from-red-900/60 to-red-800/40 border border-red-700/30"></div> Fire</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {result.patterns.map((pattern: any, pIdx: number) => (
                  <div key={pIdx} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition-colors">
                    
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-slate-800 text-slate-300 font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-700">#{pIdx + 1}</span>
                        <span className="text-sm font-semibold text-slate-300">
                          <span className="text-blue-400">{pattern.usage_count}x</span> kesilecek
                        </span>
                      </div>
                      <div className="flex gap-2 text-[11px] font-mono">
                        <span className="text-emerald-400">{((1 - pattern.waste / (result.stock_length || stockLength)) * 100).toFixed(1)}% verimli</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-red-400/70">Fire: {pattern.waste.toFixed(0)} mm</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar Kesim Haritası */}
                    <div className="w-full h-12 bg-slate-950 rounded-lg flex overflow-hidden border border-slate-800 shadow-inner relative">
                      {pattern.cuts.map((cut: number, cIdx: number) => {
                        const widthPct = (cut / (result.stock_length || stockLength)) * 100;
                        const colors = [
                          'from-emerald-500 to-green-600',
                          'from-teal-500 to-emerald-600',
                          'from-green-500 to-lime-600',
                          'from-cyan-600 to-teal-600',
                          'from-emerald-600 to-green-700',
                        ];
                        const colorClass = colors[cIdx % colors.length];
                        return (
                          <div 
                            key={cIdx} 
                            style={{ width: `${widthPct}%` }} 
                            className={`h-full bg-gradient-to-b ${colorClass} flex items-center justify-center text-xs font-black text-white/90 border-r border-slate-950/80 hover:brightness-110 transition-all cursor-crosshair group relative`}
                          >
                            <span className="drop-shadow-md text-[11px]">{cut}</span>
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-800 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-600 whitespace-nowrap z-10 shadow-xl">
                              {cut} mm ({widthPct.toFixed(1)}%)
                            </div>
                          </div>
                        );
                      })}
                      {/* Fire */}
                      {pattern.waste > 0 && (
                        <div 
                          style={{ width: `${(pattern.waste / (result.stock_length || stockLength)) * 100}%` }}
                          className="h-full bg-gradient-to-b from-red-900/40 to-red-950/60 flex items-center justify-center text-[10px] text-red-400/60 font-mono border-l border-red-800/30 relative group"
                        >
                          <div className="absolute inset-0 pattern-diagonal-lines-sm opacity-30"></div>
                          <span className="relative z-10 drop-shadow">{pattern.waste > 200 ? `${pattern.waste.toFixed(0)}` : ''}</span>
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-red-900/90 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-red-700/50 whitespace-nowrap z-10 text-red-300">
                            Fire: {pattern.waste.toFixed(0)} mm
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 flex justify-between items-center text-[10px] font-mono text-slate-600">
                      <span>0 mm</span>
                      <span>{result.stock_length || stockLength} mm</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

      </main>
      
      {/* 2D Çizim Modülü */}
      
      {showDecoration && (
        <DecorationDesigner onClose={() => setShowDecoration(false)} />
      )}
{showDesigner && (
        <WindowDesigner 
          onClose={() => setShowDesigner(false)} 
          onExport={(parts) => {
            const newOrders = [...orders];
            const filteredOrders = newOrders.filter(o => o.length > 0 && o.quantity > 0);
            setOrders([...filteredOrders, ...parts]);
            setShowDesigner(false);
          }} 
        />
      )}

      
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

            {/* AI Copilot Chat Modülü */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl w-full max-w-2xl h-[85vh] shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-500"></div>
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full relative overflow-hidden border-2 border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.3)] shrink-0">
                  <video autoPlay loop muted playsInline className="w-full h-full object-cover object-[center_20%] scale-110 relative z-10">
                    <source src="/ai.mp4" type="video/mp4" />
                  </video>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">OptiCut Copilot</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Çevrimiçi</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAiModal(false);
                  setChatAttachment(null);
                  setChatAttachmentPreview(null);
                }}
                className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div id="chat-container" className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0f172a]/50">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === "user" ? "bg-pink-600 text-white rounded-br-none" : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-none"}`}>
                    {msg.image && (
                      <img src={msg.image} alt="Uploaded" className="max-w-full h-auto rounded-lg mb-3 border border-white/10" />
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-none p-4 flex gap-2 items-center">
                     <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></span>
                     <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-slate-800 bg-slate-900/80">
              {chatAttachmentPreview && (
                <div className="mb-3 relative inline-block">
                  <img src={chatAttachmentPreview} className="h-20 rounded-lg border border-slate-700" />
                  <button 
                    onClick={() => { setChatAttachment(null); setChatAttachmentPreview(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}
              
              <div className="flex items-end gap-2">
                <label className="flex-shrink-0 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setChatAttachment(file);
                        setChatAttachmentPreview(URL.createObjectURL(file));
                      }
                  }} />
                </label>
                
                <textarea 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Yapay zekaya bir şey yaz..."
                  className="flex-1 bg-slate-800/50 border border-slate-700 focus:border-pink-500/50 text-white text-sm rounded-xl p-3 max-h-32 min-h-[44px] resize-none outline-none custom-scrollbar"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      document.getElementById("send-chat-btn")?.click();
                    }
                  }}
                />
                
                <button 
                  id="send-chat-btn"
                  disabled={aiLoading || (!chatInput.trim() && !chatAttachment)}
                  onClick={async () => {
                    if (!chatInput.trim() && !chatAttachment) return;
                    
                    const newUserMsg = { role: "user", text: chatInput, image: chatAttachmentPreview || undefined };
                    setChatMessages(prev => [...prev, newUserMsg as any]);
                    
                    const currentAttachment = chatAttachment;
                    const currentText = chatInput;
                    
                    setChatInput("");
                    setChatAttachment(null);
                    setChatAttachmentPreview(null);
                    setAiLoading(true);
                    
                    try {
                      const formData = new FormData();
                      if (currentAttachment) formData.append("file", currentAttachment);
                      formData.append("prompt", currentText);
                      
                      const res = await fetch(`${API_BASE_URL}/api/ai-analyze`, {
                        method: "POST",
                        body: formData,
                      });
                      
                      if (res.ok) {
                        const result = await res.json();
                        if (result.orders && Array.isArray(result.orders) && result.orders.length > 0) {
                           const newOrders = [...orders];
                           const filteredOrders = newOrders.filter(o => o.length > 0 && o.quantity > 0);
                           setOrders([...filteredOrders, ...result.orders]);
                           
                           setChatMessages(prev => [...prev, { role: "ai", text: result.reply ? result.reply + "\n\n(Arka plana " + result.orders.length + " parça eklendi ✨)" : "Harika! Parçaları arka plana ekledim." }]);
                        } else {
                           setChatMessages(prev => [...prev, { role: "ai", text: result.reply || "Görselden veya yazdıklarından net bir parça listesi çıkaramadım. Lütfen daha belirgin bir fotoğraf veya '1200mm den 3 adet' şeklinde bir metin gönder." }]);
                        }
                      } else {
                         setChatMessages(prev => [...prev, { role: "ai", text: "Çzgünüm, sunucuyla iletişim kurarken bir hata oluştu." }]);
                      }
                      setTimeout(() => document.getElementById('chat-container')?.scrollTo(0, (document.getElementById('chat-container')?.scrollHeight || 0)), 100);
                    } catch (e) {
                      console.error(e);
                      setChatMessages(prev => [...prev, { role: "ai", text: "Bağlantı hatası oluştu. Lütfen tekrar dene." }]);
                    }
                    setAiLoading(false);
                  }}
                  className="flex-shrink-0 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Özel CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .pattern-diagonal-lines-sm { background-image: repeating-linear-gradient(45deg, #1e293b 0, #1e293b 2px, #0f172a 0, #0f172a 50%); background-size: 8px 8px; }
      `}} />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-white">Yükleniyor...</div>}>
      <HomeContent />
    </Suspense>
  );
}
