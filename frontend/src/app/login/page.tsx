"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Geçici login simülasyonu
    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="OptiCut Logo" className="h-16 mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Hesabınıza Giriş Yapın</h1>
          <p className="text-slate-400 text-sm mt-2">OptiCut Yönetim Paneline Hoş Geldiniz</p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-700/50">
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">E-posta Adresi</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 bg-slate-950/50 border border-slate-700/50 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                placeholder="ornek@sirket.com"
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Şifre</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 bg-slate-950/50 border border-slate-700/50 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all pr-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.188-1.562c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link href="#" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">Şifremi Unuttum?</Link>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all flex justify-center items-center mt-2 disabled:opacity-70"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-400 mt-8 font-medium">
          Henüz hesabınız yok mu? <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold ml-1">Kayıt Olun</Link>
        </p>
      </div>
    </div>
  );
}
