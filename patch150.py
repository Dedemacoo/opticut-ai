
with open("frontend/src/components/WindowDesigner.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

lines[149] = "            <div className=\"relative border-4 border-white print:border-black bg-slate-800/50 print:bg-transparent shadow-2xl transition-all\" style={{ width: `${Math.min(width / 3, 300)}px`, height: `${Math.min(height / 3, 400)}px` }}>\n"

with open("frontend/src/components/WindowDesigner.tsx", "w", encoding="utf-8") as f:
    f.writelines(lines)

