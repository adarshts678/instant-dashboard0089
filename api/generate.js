export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  console.log("➡️ API route hit");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("📦 Request body:", req.body);

    const { data, prompt } = req.body;

    if (!data || !prompt) {
      return res.status(400).json({ error: "Missing data or prompt" });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY is undefined");
      return res.status(500).json({ error: "Groq API key not configured" });
    }

    // Strong system prompt with inline CSS instructions
    const systemPrompt = `
You are a frontend developer.
You will receive JSON data in this format:
{
  "report_title": "string",
  "currency": "string",
  "expenses": [
    {"item": "string", "amount": number},
    ...
  ]
}
Return ONLY valid HTML and CSS.
- Include all CSS inline using a <style> tag in the HTML head.
- Use a professional font (system-ui, Helvetica, Arial) and a light grey background (#f9f9f9).
- Table should have column headers (Item, Amount), alternating row colors, padding, and borders.
- Calculate total spending by summing all "amount" values.
- Do NOT include explanations or external stylesheets.
- Make HTML fully renderable in a browser.
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
            {
              role: "user",
              content: `const reportData = ${JSON.stringify(data)};`,
            },
            { role: "user", content: prompt },
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
