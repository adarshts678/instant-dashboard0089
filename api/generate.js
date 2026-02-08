// Force Node.js runtime on Vercel
export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  console.log("➡️ API route hit");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data, prompt } = req.body;
    console.log("📦 Request body:", req.body);

    if (!data || !prompt) {
      return res.status(400).json({ error: "Missing data or prompt" });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY is undefined");
      return res.status(500).json({ error: "Groq API key not configured" });
    }

    // Strong system prompt
    const systemPrompt = `
You are an expert frontend developer.
You will receive a JSON object containing a report.
Return ONLY valid HTML and CSS.
Do NOT invent numbers or items — use the JSON exactly.
Include all CSS inline.
- Heading with report title
- Paragraph with total spending (sum of all "amount" values)
- Table with columns: Item and Amount, with all items from the JSON
- Light grey background, professional font, padding, borders
- Fully renderable in a browser
`;

    // User message includes JSON explicitly and instructions
    const userMessage = `
Here is the report data in JSON:

${JSON.stringify(data)}

Please generate HTML and CSS for a dashboard.
- Show report_title as heading
- Calculate total spending (sum of all "amount" values")
- Render a table with all items and amounts
- Use light grey background and professional fonts
- Include all CSS inline
- Do not invent numbers, use the data exactly
${prompt}
`;

    console.log("🚀 Calling Groq API...");

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.2,
          max_tokens: 1500,
        }),
      },
    );

    console.log("📡 Groq response status:", groqRes.status);

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      console.error("❌ Groq API error:", errorText);
      return res.status(500).json({ error: "Groq API request failed" });
    }

    const groqData = await groqRes.json();
    console.log("✅ Groq response received");

    const html =
      groqData.choices?.[0]?.message?.content ||
      "<div>AI did not return HTML.</div>";

    console.log("📤 Sending HTML response");
    return res.status(200).json({ html });
  } catch (error) {
    console.error("🔥 Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
