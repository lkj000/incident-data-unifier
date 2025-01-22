import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiKeyDialog } from "@/components/ApiKeyDialog";
import { FileUpload } from "@/components/FileUpload";
import { ChatInterface } from "@/components/ChatInterface";

const Index = () => {
  const [mode, setMode] = useState("chat");
  const [isKeySet, setIsKeySet] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("openai_api_key");
    if (storedKey) {
      setIsKeySet(true);
    }
  }, []);

  const handleModeChange = (value: string) => {
    setMode(value);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">AI Assistant</h1>
      
      <div className="space-y-4">
        <ApiKeyDialog isKeySet={isKeySet} onKeySet={setIsKeySet} />

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

        <FileUpload 
          mode={mode} 
          onFileContent={(content) => {
            // Handle file content in ChatInterface
            const chatInterface = document.querySelector('textarea');
            if (chatInterface) {
              chatInterface.value = content;
              const event = new Event('input', { bubbles: true });
              chatInterface.dispatchEvent(event);
            }
          }} 
        />

        <ChatInterface mode={mode} isKeySet={isKeySet} />
      </div>
    </div>
  );
};

export default Index;