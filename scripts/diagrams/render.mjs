import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const files = process.argv.slice(2).map((file) => resolve(file));

if (files.length === 0) {
  console.error("usage: node scripts/diagrams/render.mjs <file.html> [...]");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 980, height: 400 }, deviceScaleFactor: 2 });

for (const file of files) {
  await page.goto(`file://${file}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file.replace(/\.html$/, ".png"), fullPage: true });
  console.log(file.replace(/\.html$/, ".png"));
}

await browser.close();
