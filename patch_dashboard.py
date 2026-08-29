
import sys

with open("frontend/src/components/DashboardLayout.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add state for user if not exists
if "const [user, setUser] = useState<{name: string} | null>(null);" not in content:
    content = content.replace(
        "const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);",
        "const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);\n  const [user, setUser] = useState<{name: string, email: string} | null>(null);"
    )

# Get user from local storage in useEffect
use_effect_code = """useEffect(() => {
    const token = localStorage.getItem("opticut_token");
    if (!token && !isAuthPage) {
      router.push("/login");
    } else if (token) {
      try {
        const u = JSON.parse(token);
        setUser(u);
      } catch (e) {}
    }
  }, [pathname, router, isAuthPage]);"""

if "const u = JSON.parse(token);" not in content:
    # replace the existing useEffect
    start_idx = content.find("useEffect(() => {")
    end_idx = content.find("  }, [pathname, router, isAuthPage]);") + len("  }, [pathname, router, isAuthPage]);")
    if start_idx != -1 and end_idx != -1:
        content = content[:start_idx] + use_effect_code + content[end_idx:]

# Replace the hardcoded Ugur D.
content = content.replace(
    """<div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
                  UD
                </div>""",
    """<div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : "UD"}
                </div>"""
)

content = content.replace(
    """<p className="text-sm font-bold text-slate-200">Ugur D.</p>""",
    """<p className="text-sm font-bold text-slate-200 truncate w-32">{user?.name || "Kullanici"}</p>"""
)

with open("frontend/src/components/DashboardLayout.tsx", "w", encoding="utf-8") as f:
    f.write(content)

