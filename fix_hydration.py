
import sys

with open("frontend/src/app/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "<p className=\"text-slate-500 text-sm mt-1\">Tarih: {new Date().toLocaleString(\"tr-TR\")}</p>",
    "<p suppressHydrationWarning className=\"text-slate-500 text-sm mt-1\">Tarih: {new Date().toLocaleString(\"tr-TR\")}</p>"
)

with open("frontend/src/app/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

