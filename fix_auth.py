
import sys

with open("frontend/src/components/DashboardLayout.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "setUser(u);",
    "setUser(u);\n        setIsAuthenticated(true);"
)

with open("frontend/src/components/DashboardLayout.tsx", "w", encoding="utf-8") as f:
    f.write(content)

