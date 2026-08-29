
import sys

with open("frontend/src/app/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace padding, text size, height
content = content.replace("px-3 md:px-4 py-2 rounded-lg text-xs font-bold", "px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-wide")
content = content.replace("h-[38px]", "h-[32px]")
content = content.replace("w-5 h-5", "w-4 h-4")

# Lower shadows on AI button to make it less intrusive
content = content.replace("shadow-[0_0_20px_rgba(225,29,72,0.6)] hover:shadow-[0_0_25px_rgba(225,29,72,0.8)]", "shadow-[0_0_10px_rgba(225,29,72,0.4)] hover:shadow-[0_0_15px_rgba(225,29,72,0.6)]")

# Ensure buttons have clean minimal look
content = content.replace("gap-1.5", "gap-1.5 opacity-90 hover:opacity-100")

with open("frontend/src/app/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

