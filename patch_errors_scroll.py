
import sys

# 1. Fix WindowDesigner.tsx syntax error
with open("frontend/src/components/WindowDesigner.tsx", "r", encoding="utf-8") as f:
    wd_content = f.read()

wd_content = wd_content.replace("# mock price", "// mock price")

with open("frontend/src/components/WindowDesigner.tsx", "w", encoding="utf-8") as f:
    f.write(wd_content)

# 2. Hide all scrollbars in globals.css
with open("frontend/src/app/globals.css", "r", encoding="utf-8") as f:
    css_content = f.read()

if "::-webkit-scrollbar" not in css_content:
    css_content += "\n\n/* Gizli Scrollbar (Tum sayfa icin) */\n*::-webkit-scrollbar {\n  display: none;\n}\n* {\n  -ms-overflow-style: none;  /* IE and Edge */\n  scrollbar-width: none;  /* Firefox */\n}\n"

with open("frontend/src/app/globals.css", "w", encoding="utf-8") as f:
    f.write(css_content)

# 3. Also remove custom-scrollbar styling from page.tsx to prevent conflicts
with open("frontend/src/app/page.tsx", "r", encoding="utf-8") as f:
    page_content = f.read()

page_content = page_content.replace(
    ".custom-scrollbar::-webkit-scrollbar { width: 6px; }",
    ".custom-scrollbar::-webkit-scrollbar { display: none; }"
)

with open("frontend/src/app/page.tsx", "w", encoding="utf-8") as f:
    f.write(page_content)

