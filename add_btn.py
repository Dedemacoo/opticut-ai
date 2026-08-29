
import sys

with open("frontend/src/app/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add rendering
render_code = """
      {showDecoration && (
        <DecorationDesigner onClose={() => setShowDecoration(false)} />
      )}
"""
if "<DecorationDesigner" not in content:
    target = "{showDesigner && ("
    content = content.replace(target, render_code + target)

# 2. Add button
button_html = """
            <button 
              onClick={() => handleFeatureClick("Yapi & Dekorasyon", "Pro Plus", () => setShowDecoration(true))}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-orange-900/20 border border-orange-500/50 px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 h-[38px]"
              title="Yapi & Dekorasyon Modulu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Yapi & Dekorasyon
              {plan !== "Pro Plus" && <svg className="w-3.5 h-3.5 ml-1 opacity-70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
            </button>
"""
target2 = "<div className=\"w-px h-8 bg-slate-700 hidden md:block\"></div>"
if "Yapi & Dekorasyon" not in content:
    content = content.replace(target2, button_html + "            " + target2)

with open("frontend/src/app/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

