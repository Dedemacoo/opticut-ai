
import sys

with open("frontend/src/app/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Import DecorationDesigner
if "import DecorationDesigner" not in content:
    content = content.replace(
        "import WindowDesigner from \"@/components/WindowDesigner\";",
        "import WindowDesigner from \"@/components/WindowDesigner\";\nimport DecorationDesigner from \"@/components/DecorationDesigner\";"
    )

# State for DecorationDesigner
if "const [showDecoration, setShowDecoration] = useState(false);" not in content:
    content = content.replace(
        "const [showDesigner, setShowDesigner] = useState(false);",
        "const [showDesigner, setShowDesigner] = useState(false);\n  const [showDecoration, setShowDecoration] = useState(false);"
    )

# Render DecorationDesigner
if "<DecorationDesigner onClose={() => setShowDecoration(false)} />" not in content:
    content = content.replace(
        "{showDesigner && <WindowDesigner onClose={() => setShowDesigner(false)} onExport={handleDesignerExport} />}",
        "{showDesigner && <WindowDesigner onClose={() => setShowDesigner(false)} onExport={handleDesignerExport} />}\n      {showDecoration && <DecorationDesigner onClose={() => setShowDecoration(false)} />}"
    )

# Add Button in sidebar
button_html = """
              <button 
                onClick={() => handleFeatureClick("Yapi & Dekorasyon (AI Analiz)", "Pro Plus", () => setShowDecoration(true))}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-orange-900/20 border border-orange-500/50 px-4 md:px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 mt-4 md:mt-0"
                title="Parke, fayans, alcipan hesaplari"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                Yapi & Dekorasyon
                {plan !== "Pro Plus" && <svg className="w-3.5 h-3.5 ml-1 opacity-70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
              </button>
"""

if "Yapi & Dekorasyon" not in content:
    content = content.replace(
        "iWindoor 2D",
        "iWindoor 2D"
    )
    # The best place is next to iWindoor button
    target = "</button>\n              <div className=\"w-px h-8 bg-slate-700 hidden md:block\"></div>"
    if target in content:
        content = content.replace(target, "</button>\n" + button_html + "              <div className=\"w-px h-8 bg-slate-700 hidden md:block\"></div>")


with open("frontend/src/app/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

