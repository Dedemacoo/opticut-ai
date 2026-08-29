
const puppeteer = require("puppeteer");

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    page.on("console", msg => console.log("PAGE LOG:", msg.type(), msg.text()));
    page.on("pageerror", error => console.log("PAGE ERROR:", error.message));

    console.log("Navigating...");
    await page.goto("https://opticut-alpha.vercel.app/", { waitUntil: "networkidle0", timeout: 15000 });

    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    console.log("Body length:", bodyHTML.length);
    
    if (bodyHTML.includes("Yükleniyor...")) {
        console.log("STUCK ON YÜKLENİYOR!");
    } else {
        console.log("RENDERED SUCCESSFULLY");
    }

    await browser.close();
})();

