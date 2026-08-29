
import re

with open("src/app/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add user state
user_state = """  const { plan } = usePlan();
  
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
  }, []);"""

content = content.replace("  const { plan } = usePlan();", user_state)

# 2. Add Print Header
print_header = """
          {/* SADECE PDF/YAZDIRMA EKRANINDA GORUNECEK OLAN KURUMSAL HEADER */}
          <div className="hidden print:flex justify-between items-end mb-8 pb-4 border-b-2 border-slate-800">
            <div>
              <h1 className="text-3xl font-black text-black">Kesim Raporu</h1>
              <h2 className="text-xl font-bold text-slate-700 mt-2">{user?.company || "OptiCut Kullanıcısı"}</h2>
              <p className="text-slate-500 font-medium">{user?.name} ({user?.email})</p>
              <p className="text-slate-500 text-sm mt-1">Tarih: {new Date().toLocaleString("tr-TR")}</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <img src="/logo.png" alt="OptiCut Logo" className="h-10 mb-2 object-contain" />
              <p className="text-sm font-bold text-blue-600">OptiCut AI - Üretim Yönetimi</p>
              <p className="text-xs text-slate-500">www.opticut.com</p>
            </div>
          </div>
"""
content = content.replace("{!activeProject && (", print_header + "          {!activeProject && (")

# 3. Replace handleExportExcel
# Using regex to find the whole function body safely.
def get_function_body(content, func_name):
    start_idx = content.find(f"const {func_name} = async () => {{")
    if start_idx == -1:
        return None, None, None
    # find matching brace
    brace_count = 0
    end_idx = -1
    for i in range(start_idx, len(content)):
        if content[i] == "{":
            brace_count += 1
        elif content[i] == "}":
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break
    
    # check for trailing semicolon
    if end_idx != -1 and end_idx < len(content) and content[end_idx] == ";":
        end_idx += 1
    
    return start_idx, end_idx, content[start_idx:end_idx]

start, end, func = get_function_body(content, "handleExportExcel")
if start != -1:
    new_excel = """const handleExportExcel = async () => {
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
  };"""
    content = content[:start] + new_excel + content[end:]

with open("src/app/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Done")

