
const puppeteer = require("puppeteer-core");
const fs = require("fs");

(async () => {
    let executablePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    if (!fs.existsSync(executablePath)) {
        executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    }

    console.log("Using browser:", executablePath);
    const browser = await puppeteer.launch({ executablePath, headless: true });
    const page = await browser.newPage();

    page.on("console", msg => console.log("PAGE LOG:", msg.type(), msg.text()));
    page.on("pageerror", error => console.log("PAGE ERROR:", error.message));

    console.log("Navigating...");
    await page.goto("https://opticut-alpha.vercel.app/", { waitUntil: "networkidle0" });

    const html = await page.evaluate(() => document.body.innerHTML);
    if (html.includes("Yükleniyor...")) {
        console.log("STUCK ON YÜKLENİYOR");
    } else {
        console.log("SUCCESS!");
    }

    await browser.close();
})();

