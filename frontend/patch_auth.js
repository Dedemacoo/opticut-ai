
const fs = require("fs");

// 1. Patch login page to save token
let login = fs.readFileSync("src/app/login/page.tsx", "utf8");
login = login.replace(
  "setIsLoading(false);\n      router.push(\"/\");", 
  "setIsLoading(false);\n      localStorage.setItem(\"opticut_token\", \"valid\");\n      router.push(\"/\");"
);
fs.writeFileSync("src/app/login/page.tsx", login, "utf8");

// 2. Patch DashboardLayout to redirect if no token
let dash = fs.readFileSync("src/components/DashboardLayout.tsx", "utf8");
let inject = `
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (!isAuthPage) {
      const token = localStorage.getItem("opticut_token");
      if (!token) {
        router.push("/login");
      }
    }
  }, [pathname, router, isAuthPage]);

  if (isAuthPage) {
    return <>{children}</>;
  }
`;
dash = dash.replace(
  "export default function DashboardLayout({ children }: { children: React.ReactNode }) {\n  const pathname = usePathname();\n  const router = useRouter();",
  "export default function DashboardLayout({ children }: { children: React.ReactNode }) {\n  const pathname = usePathname();\n  const router = useRouter();\n" + inject
);
fs.writeFileSync("src/components/DashboardLayout.tsx", dash, "utf8");

