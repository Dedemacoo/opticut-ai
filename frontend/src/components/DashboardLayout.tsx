"use client";

import { API_BASE_URL } from "@/config";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const [projects, setProjects] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const activeProjectId = searchParams.get("projectId") ? Number(searchParams.get("projectId")) : null;

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("opticut_token");
    if (!token && !isAuthPage) {
      router.push("/login");
    } else if (token) {
      try {
        const u = JSON.parse(token);
        setUser(u);
        setIsAuthenticated(true);
      } catch (e) {}
    }
  }, [pathname, router, isAuthPage]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/`);
      const data = await res.json();
      setProjects(data);
    } catch (e) {
      console.error("Projeler yuklenemedi", e);
    }
  };

  useEffect(() => {
    if (!isAuthPage && isAuthenticated) {
      fetchProjects();
      const handleProjectAdded = () => fetchProjects();
      window.addEventListener("refresh-projects", handleProjectAdded);
      return () => window.removeEventListener("refresh-projects", handleProjectAdded);
    }
  }, [isAuthPage, isAuthenticated]);

  // Auth pages: no sidebar, no layout
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Not authenticated yet, show loading
  if (!isAuthenticated) {
    return <div className="h-screen bg-[#0f172a] text-white flex items-center justify-center">Yukleniyor...</div>;
  }

  const handleDeleteProject = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bu projeyi silmek istediginize emin misiniz?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (activeProjectId === id) {
          router.push("/");
        }
        fetchProjects();
      }
    } catch (e) {
      console.error("Silme hatasi:", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("opticut_token");
    localStorage.removeItem("opticut_plan");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* Mobil Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`print:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#1e293b] border-r border-slate-700/50 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-slate-800 flex flex-col items-center relative">
          <img src="/logo.png" alt="OptiCut Logo" className="w-48 h-auto object-contain drop-shadow-xl mb-4" />
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider text-center">Kurumsal Uretim Yonetimi</p>
          <button 
            className="absolute top-4 right-4 md:hidden text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-4">
          <button 
            onClick={() => {
              router.push("/");
              setIsMobileMenuOpen(false);
            }} 
            className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Yeni Hesaplama
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 ml-2">Gecmis Projeler</h3>
          {projects.length === 0 ? (
            <p className="text-sm text-slate-600 italic ml-2">Henuz proje yok...</p>
          ) : (
            projects.map(p => (
              <div 
                key={p.id}
                onClick={() => {
                  router.push(`/?projectId=${p.id}`);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${pathname === "/" && activeProjectId === p.id ? "bg-blue-900/40 border border-blue-700/50 text-blue-300" : "hover:bg-slate-800 border border-transparent text-slate-400 hover:text-slate-200"}`}
              >
                <div className="flex items-center gap-3 truncate">
                  <svg className={`w-4 h-4 flex-shrink-0 ${pathname === "/" && activeProjectId === p.id ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="truncate text-sm font-medium">{p.name}</span>
                </div>
                <button 
                  onClick={(e) => handleDeleteProject(p.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                  title="Projeyi Sil"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))
          )}
        </div>
        
        {/* User Profile / Settings Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center justify-between p-2 rounded-lg transition-all ${pathname === "/settings" ? "bg-slate-800" : "hover:bg-slate-800/80"}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
                UD
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200 truncate w-32">{user?.name || "Kullanici"}</p>
                <p className="text-xs text-slate-500">Ayarlari Yonet</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </Link>
          <button onClick={handleLogout} className="w-full mt-3 text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 py-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Cikis Yap
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar flex flex-col">
        {/* Mobil Header */}
        <div className="print:hidden md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-[#1e293b]">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <img src="/logo.png" alt="Logo" className="h-6 object-contain" />
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs">
            UD
          </div>
        </div>
        
        {/* Icerik */}
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

