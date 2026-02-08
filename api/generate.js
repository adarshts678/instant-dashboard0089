export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  console.log("API route hit");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data, prompt } = req.body;
    console.log(" Request body:", req.body);

    if (!data || !prompt) {
      return res.status(400).json({ error: "Missing data or prompt" });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      console.error(" GROQ_API_KEY is undefined");
      return res.status(500).json({ error: "Groq API key not configured" });
    }

    const systemPrompt = `
You are an expert frontend developer.
You will receive a report with JSON data.
Return ONLY valid HTML and CSS.
Do NOT leave placeholders — fill all values directly.
Include all CSS inline.
- Heading with report title
- Paragraph with total spending (sum of all "amount" values)
- Table with columns: Item and Amount, populated from the JSON
- Light grey background (#f9f9f9), dark text (#333)
- Professional font, padding, borders
- Fully renderable in a browser
`;

    const userMessage = `
Here is the report data:

Title: ${data.report_title}
Currency: ${data.currency}
Expenses:
${data.expenses.map((e) => `- ${e.item}: ${e.amount}`).join("\n")}

Generate complete HTML with CSS inline for a business dashboard:
- Light grey background (#f9f9f9)
- Dark text (#333)
- Professional font (system-ui, Helvetica, Arial)
- Include total spending calculated from the data
- Table with all items and amounts filled in
- Include all table styling inline (borders, header background, alternating row colors)
- Fill all values directly — do NOT leave placeholders like {{ item }} or {{ total }}
${prompt}
`;

    console.log("Calling Groq API...");

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

    console.log("Groq response status:", groqRes.status);

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      console.error("Groq API error:", errorText);
      return res.status(500).json({ error: "Groq API request failed" });
    }

    const groqData = await groqRes.json();
    console.log("Groq response received");

    const html =
      groqData.choices?.[0]?.message?.content ||
      "<div>AI did not return HTML.</div>";

    console.log("Sending HTML response");
    return res.status(200).json({ html });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
