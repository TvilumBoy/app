// Serverless API til Vercel
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, uploaded_text } = req.body;

  // Læs manifest med de forudindlæste PDF'er
  const manifestPath = path.join(process.cwd(), "public/docs/manifest.json");
  let docs = [];
  if (fs.existsSync(manifestPath)) {
    const content = fs.readFileSync(manifestPath, "utf8");
    docs = JSON.parse(content);
  }

  // Lav kontekst fra dokumenter
  const docsText = docs.map(d => d.text).join("\n\n").slice(0, 14000);
  const combinedPrompt = `
Du er en AI, der svarer baseret på følgende dokumenter:

${docsText}

Hvis brugeren også har uploadet et dokument, er teksten her:
${uploaded_text || "Ingen uploadet tekst."}

Brugerens spørgsmål: ${prompt}
`;

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + process.env.GEMINI_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: combinedPrompt }] }]
      })
    });

    const data = await response.json();
    res.status(200).json({ result: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini API call failed" });
  }
}
