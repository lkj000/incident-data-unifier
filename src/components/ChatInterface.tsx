import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendChatMessage } from "@/utils/openai";
import { ChatInput } from "./ChatInput";
import { ChatResponse } from "./ChatResponse";

interface ChatInterfaceProps {
  mode: string;
  isKeySet: boolean;
}

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

export const ChatInterface = ({ mode, isKeySet }: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const systemPrompt = getSystemPrompt(mode);
      const responseContent = await sendChatMessage(
        storedKey,
        systemPrompt,
        message,
        controller.signal
      );
      setResponse(responseContent);
    } catch (error) {
      console.error("OpenAI API Error:", error);
      let errorMessage = "Failed to get response from OpenAI";
      
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage = "Network error. Please check your internet connection and try again. If you're using an ad blocker or privacy extension, try disabling it for this site.";
      } else if (error instanceof DOMException && error.name === "AbortError") {
        errorMessage = "Request timed out. Please try again.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      if (errorMessage.includes("Invalid API key")) {
        localStorage.removeItem("openai_api_key");
        window.location.reload();
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <ChatInput
        message={message}
        isLoading={isLoading}
        isKeySet={isKeySet}
        onMessageChange={setMessage}
        onSubmit={handleSubmit}
      />
      <ChatResponse response={response} />
    </div>
  );
};