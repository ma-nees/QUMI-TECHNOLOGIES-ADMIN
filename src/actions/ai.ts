'use server';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || "";

export async function enhanceTextWithAI(text: string, context: 'reply' | 'description'): Promise<{ success: true; enhancedText: string } | { success: false; error: string }> {
  if (!text || !text.trim()) {
    return { success: false, error: "Text is empty." };
  }

  let prompt = "";
  if (context === 'reply') {
    prompt = `You are a professional customer support representative for QUMI Technologies. Enhance the following draft reply to a client to make it sound highly professional, polite, and articulate. Maintain the core meaning but improve the tone. Do NOT add any surrounding quotes or introductory text. Do NOT add any sign-off, signature, or closing (like "Best regards") - the system will automatically append the signature later. Just output the body of the message.\n\nDraft:\n${text}`;
  } else {
    prompt = `You are an expert copywriter for QUMI Technologies. Enhance the following company description/text to make it sound premium, engaging, and professional. \nIMPORTANT RULES:\n- Do NOT use any Markdown formatting (no asterisks ** for bolding).\n- Use plain text only.\n- Ensure proper line breaks and spacing using newline characters so paragraphs and list items do not merge together.\n- Do NOT add any surrounding quotes or introductory text.\n\nDraft:\n${text}`;
  }

  try {
    let response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "open-mistral-7b", // Using a smaller model which might have better free-tier limits
        messages: [{ role: "user", content: prompt }]
      })
    });

    // Simple retry on rate limit
    if (response.status === 429) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: "open-mistral-7b",
          messages: [{ role: "user", content: prompt }]
        })
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Mistral API Error:", errorData);
      
      if (response.status === 429) {
        throw new Error("Mistral API Rate Limit Exceeded. Please check your API account limits or billing.");
      }
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const enhancedText = data.choices?.[0]?.message?.content?.trim();

    if (!enhancedText) {
      throw new Error("Invalid response from AI.");
    }

    return { success: true, enhancedText };
  } catch (error: any) {
    console.error("AI Enhancement Error:", error);
    return { success: false, error: error.message };
  }
}
