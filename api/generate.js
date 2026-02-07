export default async function handler(req, res) {
  console.log("➡️ API route hit");

  // 1️⃣ Method check
  if (req.method !== "POST") {
    console.error("❌ Invalid method:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 2️⃣ Log request body
    console.log("📦 Request body:", req.body);

    const { data, prompt } = req.body;

    if (!data || !prompt) {
      console.error("❌ Missing data or prompt");
      return res.status(400).json({ error: "Missing data or prompt" });
    }

    // 3️⃣ Check env variable (DON’T log the actual key)
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY is undefined");
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    console.log("🔐 OpenAI key exists");

    // 4️⃣ Call OpenAI
    console.log("🚀 Calling OpenAI API...");
    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a frontend developer. Output only valid HTML/CSS for a dashboard.",
            },
            {
              role: "user",
              content: `Data: ${JSON.stringify(data)}\nPrompt: ${prompt}`,
            },
          ],
          max_tokens: 1000,
        }),
      },
    );

    console.log("📡 OpenAI response status:", openaiRes.status);

    // 5️⃣ Handle OpenAI API errors
    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("❌ OpenAI API error:", errorText);
      return res.status(500).json({ error: "OpenAI API request failed" });
    }

    const openaiData = await openaiRes.json();
    console.log("✅ OpenAI response received");

    const html =
      openaiData.choices?.[0]?.message?.content ||
      "<div>AI did not return HTML.</div>";

    // 6️⃣ Final response
    console.log("📤 Sending HTML response");
    return res.status(200).json({ html });
  } catch (error) {
    console.error("🔥 Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
