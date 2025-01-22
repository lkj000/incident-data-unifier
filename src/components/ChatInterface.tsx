import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ChatInterfaceProps {
  mode: string;
  isKeySet: boolean;
}

export const ChatInterface = ({ mode, isKeySet }: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getSystemPrompt = (mode: string) => {
    switch (mode) {
      case "email":
        return "You are a helpful assistant that helps write professional emails. Format the response properly and maintain a professional tone.";
      case "translate":
        return "You are a translation assistant. Detect the source language and translate the text to English. If the text is in English, ask which language to translate to.";
      case "interview":
        return "You are an interview preparation assistant. Provide detailed feedback and suggestions for improvement.";
      case "summarize":
        return "You are a summarization assistant. Provide a concise summary of the text while maintaining all key points.";
      default:
        return "You are a helpful assistant. Provide clear and concise responses.";
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    const storedKey = localStorage.getItem("openai_api_key");
    if (!storedKey) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenAI API key first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const systemPrompt = getSystemPrompt(mode);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = "Failed to get response from OpenAI";
        
        if (response.status === 401) {
          errorMessage = "Invalid API key. Please check your OpenAI API key and try again.";
          localStorage.removeItem("openai_api_key");
          window.location.reload();
        } else if (response.status === 429) {
          errorMessage = "Rate limit exceeded. Please try again in a few moments.";
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResponse(data.choices[0].message.content);
    } catch (error) {
      console.error("OpenAI API Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response from OpenAI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Enter your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[100px]"
      />

      <Button
        onClick={handleSubmit}
        disabled={isLoading || !isKeySet}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <MessageSquare className="h-4 w-4 mr-2" />
        )}
        {isLoading ? "Processing..." : "Send Message"}
      </Button>

      {response && (
        <Card className="p-4 mt-4">
          <h2 className="font-semibold mb-2">Response:</h2>
          <div className="whitespace-pre-wrap">{response}</div>
        </Card>
      )}
    </div>
  );
};