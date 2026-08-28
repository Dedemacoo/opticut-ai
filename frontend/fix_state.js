
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf-8");

const state_injections = `
  const router = useRouter();
  const searchParams = useSearchParams();
  const { plan } = usePlan();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [upgradeTargetPlan, setUpgradeTargetPlan] = useState("");

  const handleFeatureClick = (feature: string, requiredPlan: string, action: () => void) => {
    const plans = ["Standart", "Pro", "Pro Plus"];
    const currentIdx = plans.indexOf(plan);
    const requiredIdx = plans.indexOf(requiredPlan);

    if (currentIdx >= requiredIdx) {
      action();
    } else {
      setUpgradeMessage(\`"\${feature}" özelliðini kullanmak için planýnýzý yükseltmeniz gerekmektedir.\`);
      setUpgradeTargetPlan(requiredPlan);
      setShowUpgradeModal(true);
    }
  };
`;

content = content.replace("  const [stockLength, setStockLength] = useState<number>(6000);", state_injections + "  const [stockLength, setStockLength] = useState<number>(6000);");
fs.writeFileSync("src/app/page.tsx", content, "utf-8");
console.log("State injected");

