
const puppeteer = require("puppeteer-core");
(async () => {
    let executablePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const browser = await puppeteer.launch({ executablePath, headless: true });
    const page = await browser.newPage();
    page.on("console", msg => console.log("LOG:", msg.type(), msg.text()));
    page.on("pageerror", err => console.log("PAGE ERROR:", err.message));
    
    console.log("Navigating to http://localhost:3000");
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
    
    // Look for nextjs error overlay
    const errorOverlay = await page.evaluate(() => {
        const nextErr = document.querySelector("nextjs-portal");
        return nextErr ? nextErr.innerHTML : null;
    });
    if (errorOverlay) {
        console.log("NEXT.JS ERROR OVERLAY FOUND!");
    } else {
        console.log("No nextjs error overlay");
    }
    
    const html = await page.evaluate(() => document.body.innerHTML);
    if (html.includes("Yükleniyor...")) console.log("STUCK");
    else console.log("SUCCESS");
    
    await browser.close();
})();

