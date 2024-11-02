import fs from "fs";
import path from "path";
import { chromium } from "playwright";

// Crée une fonction asynchrone pour le script de scraping.
export async function scrapeDocumentaion() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("https://nextjs.org/docs/");

  // recuperé les lien de la documentation
  const links = await page.$$eval(
    'a[href^="/docs/"]',
    (anchors: HTMLAnchorElement[]) => anchors.map((anchor) => anchor.href)
  );

  //prepation du dossier de sauvegarde
  const outputDir = path.join(__dirname, "data", "nextjs");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  //parcourir les lien et sauvegarder le contenu
  for (const link of links) {
    if (!link || !link.startsWith("https://nextjs.org/docs/")) {
      continue;
    }
    await page.goto(link);
    console.log("Scraping", link);
    const content = await page.evaluate(() => {
      return document.body.innerText;
    });

    //utiliser l'URL pour identifier le contenu extrait
    const filename =
      link.replace("https://nextjs.org/docs/", "").replace(/^-/, "") + ".txt";
    const filepath = path.join(outputDir, filename);

    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    //sauvegarder le contenu
    console.log("Saving to", filepath);
    fs.writeFileSync(filepath, content);
  }
  console.log("Scraping done");
  await browser.close();
}

// Appeler la fonction de scraping
scrapeDocumentaion().catch((error) => {
  console.error("Scraping failed:", error);
  process.exit(1);
});
