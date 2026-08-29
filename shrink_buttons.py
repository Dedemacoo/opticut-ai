
import sys

with open("frontend/src/app/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Shrink AI Button
content = content.replace(
    "px-5 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 group h-[44px]",
    "px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap flex-shrink-0 group h-[38px]"
)

# Shrink iWindoor Button
content = content.replace(
    "px-4 md:px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0",
    "px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 h-[38px]"
)

# Shrink Yapi Button
content = content.replace(
    "px-4 md:px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 mt-4 md:mt-0",
    "px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 h-[38px]"
)

with open("frontend/src/app/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

