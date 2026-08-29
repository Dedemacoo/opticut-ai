
with open("frontend/src/components/WindowDesigner.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Add states for save and project name, and user token
import_hook = "import { useState, useEffect } from \"react\";"
text = text.replace("import { useState } from \x27react\x27;", import_hook)

state_hook = """
  const [projectName, setProjectName] = useState("Yeni Cizim");
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState<{company: string, name: string, email: string} | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("opticut_token");
    if(t) {
      try { setUser(JSON.parse(t)); } catch(e){}
    }
  }, []);

  const handlePrint = () => window.print();
  
  const handleSave = async () => {
    try {
      await fetch("https://opticut-ai.onrender.com/api/iwindoor/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          design_data: JSON.stringify({ width, height, verticalDivisions, horizontalDivisions, paneTypes }),
          total_price: 1500
        })
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch(e) {}
  };
"""
target = "const [paneTypes, setPaneTypes] = useState<Record<string, PaneType>>({});"
text = text.replace(target, target + "\n" + state_hook)

# 2. Add Project Name input to sidebar
sidebar_injection = """
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Proje Adi</label>
                <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-indigo-500" />
              </div>
"""
text = text.replace(
    "<div className=\"space-y-6\">",
    "<div className=\"space-y-6\">" + sidebar_injection
)

# 3. Add Print Classes and Print Header
text = text.replace(
    "<div className=\"fixed inset-0 bg-slate-950/80 z-50 flex flex-col backdrop-blur-sm\">",
    "<div className=\"fixed inset-0 bg-slate-950/80 z-50 flex flex-col backdrop-blur-sm print:static print:bg-white print:block\">"
)
text = text.replace(
    "<div className=\"flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center\">",
    "<div className=\"flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center print:p-0 print:block\">"
)
text = text.replace(
    "<div className=\"bg-[#1e293b] w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col md:flex-row\">",
    "<div className=\"bg-[#1e293b] print:bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-800 print:border-none print:shadow-none overflow-hidden flex flex-col md:flex-row\">"
)
text = text.replace(
    "<div className=\"w-full md:w-1/3 bg-slate-900 p-6 border-r border-slate-800 overflow-y-auto max-h-[80vh]\">",
    "<div className=\"w-full md:w-1/3 bg-slate-900 print:hidden p-6 border-r border-slate-800 overflow-y-auto max-h-[80vh]\">"
)
text = text.replace(
    "<div className=\"w-full md:w-2/3 p-6 md:p-10 relative bg-[#0f172a] flex flex-col items-center justify-center min-h-[500px]\">",
    "<div className=\"w-full md:w-2/3 p-6 md:p-10 relative bg-[#0f172a] print:bg-white flex flex-col items-center justify-center min-h-[500px]\">"
)

print_header_and_buttons = """
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
"""
text = text.replace(
    "<div className=\"w-full md:w-2/3 p-6 md:p-10 relative bg-[#0f172a] print:bg-white flex flex-col items-center justify-center min-h-[500px]\">",
    "<div className=\"w-full md:w-2/3 p-6 md:p-10 relative bg-[#0f172a] print:bg-white flex flex-col items-center justify-center min-h-[500px]\">\n" + print_header_and_buttons
)

with open("frontend/src/components/WindowDesigner.tsx", "w", encoding="utf-8") as f:
    f.write(text)

