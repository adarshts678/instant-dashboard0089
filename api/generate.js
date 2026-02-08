export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  console.log("➡️ API route hit");

  if (req.method !== "POST") {
    console.error("❌ Invalid method:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("📦 Request body:", req.body);

    const { data, prompt } = req.body;

    if (!data || !prompt) {
      console.error("❌ Missing data or prompt");
      return res.status(400).json({ error: "Missing data or prompt" });
    }

    // ✅ Check Groq key
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY is undefined");
      return res.status(500).json({ error: "Groq API key not configured" });
    }
    console.log("🔐 Groq key exists");

    const systemPrompt = `
You are a frontend developer.
Return ONLY valid HTML and CSS.
Do NOT include explanations.
Use the provided JSON data exactly.
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
            { role: "user", content: JSON.stringify(data) },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 1200,
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
