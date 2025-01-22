import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { MessageSquare, Upload, Loader2 } from "lucide-react";

const Index = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [mode, setMode] = useState("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleModeChange = (value: string) => {
    setMode(value);
    setMessage("");
    setResponse("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "text/plain" || file.type === "application/pdf") {
        setFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result;
          if (typeof text === "string") {
            setMessage(text);
          }
        };
        reader.readAsText(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a .txt or .pdf file",
          variant: "destructive",
        });
      }
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

    setIsLoading(true);
    try {
      const systemPrompt = getSystemPrompt(mode);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setResponse(data.choices[0].message.content);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from OpenAI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">AI Assistant</h1>
      
      <div className="space-y-4">
        <Select value={mode} onValueChange={handleModeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chat">General Chat</SelectItem>
            <SelectItem value="email">Email Writing</SelectItem>
            <SelectItem value="translate">Translation</SelectItem>
            <SelectItem value="interview">Interview Prep</SelectItem>
            <SelectItem value="summarize">Summarization</SelectItem>
          </SelectContent>
        </Select>

        {(mode === "translate" || mode === "summarize") && (
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileUpload}
              className="flex-1"
            />
            <Button variant="outline" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Textarea
          placeholder="Enter your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[100px]"
        />

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
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
    </div>
  );
};

export default Index;