
import sys

with open("frontend/src/components/DashboardLayout.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "UD\n                </div>",
    "{user?.name ? user.name.substring(0, 2).toUpperCase() : \"UD\"}\n                </div>"
)

with open("frontend/src/components/DashboardLayout.tsx", "w", encoding="utf-8") as f:
    f.write(content)

