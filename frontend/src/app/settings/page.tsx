"use client";

import { useState } from "react";
import { usePlan, PlanType } from "@/context/PlanContext";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("billing");
  const { plan, setPlan } = usePlan();
  
  // Genel Ayarlar State
  const [stockLength, setStockLength] = useState("6000");
  const [kerf, setKerf] = useState("3");
  const [company, setCompany] = useState("OptiCut LTD ŞTİ");
  const [currency, setCurrency] = useState("TRY");
  const [isSaved, setIsSaved] = useState(false);

  // Bildirim Ayarları State
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const planDetails: Record<PlanType, { price: string, desc: string, icon: any, color: string }> = {
    "Standart": {
      price: "3.500 ₺",
      desc: "Sadece Fire ve Kesim Hesabı",
      color: "from-slate-600 to-slate-800",
      icon: <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    },
    "Pro": {
      price: "7.000 ₺",
      desc: "iWindoor Çizim Özelliği Aktif",
      color: "from-blue-600 to-indigo-800",
      icon: <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" /></svg>
    },
    "Pro Plus": {
      price: "15.000 ₺",
      desc: "Tüm Özellikler + Yapay Zeka Asistanı Sınırsız",
      color: "from-purple-600 to-fuchsia-800",
      icon: <svg className="w-6 h-6 text-fuchsia-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="mb-8 border-b border-slate-800 pb-5 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Ayarlar</h2>
          <p className="text-slate-500 text-sm mt-1.5">Uygulama tercihlerinizi, abonelik ve kurumsal bilgilerinizi yönetin.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400">
          Aktif Plan: <span className="font-bold text-white ml-1">{plan}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sol Menü */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 overflow-hidden shadow-lg sticky top-6">
            <div className="p-4 border-b border-slate-800 bg-slate-800/30">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menü</h3>
            </div>
            <div className="flex flex-col p-2 space-y-1">
              <button 
                onClick={() => setActiveTab("general")}
                className={`px-4 py-2.5 text-sm text-left rounded-xl transition-all flex items-center gap-3 ${activeTab === "general" ? 'bg-blue-600/10 text-blue-400 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                Genel Ayarlar
              </button>
              <button 
                onClick={() => setActiveTab("billing")}
                className={`px-4 py-2.5 text-sm text-left rounded-xl transition-all flex items-center gap-3 ${activeTab === "billing" ? 'bg-blue-600/10 text-blue-400 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                Abonelik & Fatura
              </button>
              <button 
                onClick={() => setActiveTab("notifications")}
                className={`px-4 py-2.5 text-sm text-left rounded-xl transition-all flex items-center gap-3 ${activeTab === "notifications" ? 'bg-blue-600/10 text-blue-400 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                Bildirimler
              </button>
            </div>
          </div>
        </div>

        {/* Sağ İçerik Alanı */}
        <div className="flex-1">
          
          {/* GENEL AYARLAR */}
          {activeTab === "general" && (
            <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-[#1e293b] p-7 rounded-2xl border border-slate-700/50 shadow-xl">
                <h3 className="text-sm font-bold text-slate-100 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></span>
                  Kurumsal Bilgiler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Firma Adı</label>
                    <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Para Birimi</label>
                    <div className="relative">
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none cursor-pointer">
                        <option value="TRY">Türk Lirası (₺)</option>
                        <option value="USD">Dolar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                      <svg className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e293b] p-7 rounded-2xl border border-slate-700/50 shadow-xl">
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg></span>
                    Varsayılan Optimizasyon Değerleri
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 pl-10">Yeni bir üretim planı oluşturulduğunda bu değerler otomatik olarak formda yer alacaktır.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-10">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Varsayılan Stok Boyu (mm)</label>
                    <input type="number" value={stockLength} onChange={(e) => setStockLength(e.target.value)} className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Varsayılan Bıçak Payı / Kerf (mm)</label>
                    <input type="number" value={kerf} onChange={(e) => setKerf(e.target.value)} className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-mono" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-800">
                {isSaved && (
                  <span className="text-emerald-400 text-sm font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Başarıyla kaydedildi
                  </span>
                )}
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/50 transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          )}

          {/* FATURA AYARLARI */}
          {activeTab === "billing" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.keys(planDetails) as PlanType[]).map((pName) => {
                  const details = planDetails[pName];
                  const isActive = plan === pName;
                  
                  return (
                    <div 
                      key={pName} 
                      className={`relative p-5 rounded-2xl border transition-all cursor-pointer overflow-hidden ${isActive ? `bg-gradient-to-br ${details.color} border-transparent shadow-xl ring-2 ring-white/20 scale-105 z-10` : 'bg-slate-900/50 border-slate-700 hover:border-slate-500 opacity-70 hover:opacity-100'}`}
                      onClick={() => setPlan(pName)}
                    >
                      {isActive && <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full">Aktif</div>}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isActive ? 'bg-white/10' : 'bg-slate-800'}`}>
                        {details.icon}
                      </div>
                      <h4 className={`text-lg font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>{pName}</h4>
                      <p className={`text-2xl font-black mt-2 ${isActive ? 'text-white' : 'text-slate-300'}`}>{details.price} <span className="text-xs font-normal opacity-70">/ ay</span></p>
                      <p className={`text-xs mt-3 ${isActive ? 'text-white/80' : 'text-slate-500'}`}>{details.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#1e293b] p-7 rounded-2xl border border-slate-700/50 shadow-xl mt-8">
                <h3 className="text-sm font-bold text-slate-100 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg></span>
                  Ödeme Yöntemi
                </h3>
                <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-800 p-2 rounded shrink-0">
                      <svg className="w-8 h-6 text-slate-300" viewBox="0 0 24 24" fill="currentColor"><path d="M2.25 4.5A3.75 3.75 0 00-1.5 8.25v7.5A3.75 3.75 0 002.25 19.5h19.5A3.75 3.75 0 0025.5 15.75v-7.5A3.75 3.75 0 0021.75 4.5H2.25zM19.5 15.75a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V8.25a.75.75 0 01.75-.75h13.5a.75.75 0 01.75.75v7.5z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">•••• •••• •••• 4242</p>
                      <p className="text-xs text-slate-500">Son Kullanma: 12/28</p>
                    </div>
                  </div>
                  <button className="text-xs font-semibold text-blue-400 hover:text-blue-300">Güncelle</button>
                </div>
              </div>
            </div>
          )}

          {/* BILDIRIMLER */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-[#1e293b] p-7 rounded-2xl border border-slate-700/50 shadow-xl">
                <h3 className="text-sm font-bold text-slate-100 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></span>
                  İletişim Tercihleri
                </h3>
                
                <div className="space-y-5">
                  <div className="flex items-center justify-between py-3 border-b border-slate-800">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">E-posta Bildirimleri</p>
                      <p className="text-xs text-slate-500 mt-0.5">Sistem güncellemeleri ve fatura detayları e-posta ile gelsin.</p>
                    </div>
                    <button onClick={() => setEmailNotif(!emailNotif)} className={`relative w-12 h-6 rounded-full transition-colors ${emailNotif ? 'bg-blue-600' : 'bg-slate-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${emailNotif ? 'translate-x-[26px]' : 'translate-x-1'}`}></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-slate-800">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Haftalık Raporlar</p>
                      <p className="text-xs text-slate-500 mt-0.5">Her pazartesi kesim ve verimlilik raporlarını gönder.</p>
                    </div>
                    <button onClick={() => setWeeklyReport(!weeklyReport)} className={`relative w-12 h-6 rounded-full transition-colors ${weeklyReport ? 'bg-blue-600' : 'bg-slate-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${weeklyReport ? 'translate-x-[26px]' : 'translate-x-1'}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">SMS Uyarıları</p>
                      <p className="text-xs text-slate-500 mt-0.5">Stok uyarıları için telefonuma SMS gönder.</p>
                    </div>
                    <button onClick={() => setSmsNotif(!smsNotif)} className={`relative w-12 h-6 rounded-full transition-colors ${smsNotif ? 'bg-blue-600' : 'bg-slate-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${smsNotif ? 'translate-x-[26px]' : 'translate-x-1'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
