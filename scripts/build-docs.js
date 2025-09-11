// Node script der kører ved build for at lave manifest.json af PDF'er
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");

const docsDir = path.join(__dirname, "../public/docs");
const manifestPath = path.join(docsDir, "manifest.json");

async function processPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

async function buildManifest() {
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith(".pdf"));
  const manifest = [];

  for (const file of files) {
    const filePath = path.join(docsDir, file);
    console.log("Processing:", file);
    try {
      const text = await processPDF(filePath);
      manifest.push({
        filename: file,
        url: `/docs/${file}`,
        text: text.slice(0, 20000) // trim for sikkerhed
      });
    } catch (err) {
      console.error("Error processing", file, err);
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("Manifest built at", manifestPath);
}

buildManifest();
