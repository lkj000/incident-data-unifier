interface ChatMessage {
  role: string;
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export const sendChatMessage = async (
  apiKey: string,
  systemPrompt: string,
  message: string,
  signal: AbortSignal
): Promise<string> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = "Failed to get response from OpenAI";
    
    if (response.status === 401) {
      errorMessage = "Invalid API key. Please check your OpenAI API key and try again.";
    } else if (response.status === 429) {
      errorMessage = "Rate limit exceeded. Please try again in a few moments.";
    } else if (errorData.error?.message) {
      errorMessage = errorData.error.message;
    }
    
    throw new Error(errorMessage);
  }

  const data: OpenAIResponse = await response.json();
  return data.choices[0].message.content;
}