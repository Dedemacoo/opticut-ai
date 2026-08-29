
const puppeteer = require("puppeteer-core");
(async () => {
    let executablePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const browser = await puppeteer.launch({ executablePath, headless: true });
    const page = await browser.newPage();
    page.on("console", msg => console.log("LOG:", msg.text()));
    await page.goto("https://opticut-alpha.vercel.app/login", { waitUntil: "networkidle0" });
    const html = await page.evaluate(() => document.body.innerHTML);
    if (html.includes("Yükleniyor...")) console.log("STUCK");
    else console.log("SUCCESS");
    await browser.close();
})();

