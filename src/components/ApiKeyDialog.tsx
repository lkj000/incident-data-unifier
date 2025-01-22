import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ApiKeyDialogProps {
  isKeySet: boolean;
  onKeySet: (isSet: boolean) => void;
}

export const ApiKeyDialog = ({ isKeySet, onKeySet }: ApiKeyDialogProps) => {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem("openai_api_key", apiKey.trim());
      onKeySet(true);
      setApiKey("");
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been securely saved",
      });
    }
  };

  if (isKeySet) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Key className="h-4 w-4 mr-2" />
          Set OpenAI API Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter your OpenAI API Key</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <Button onClick={handleApiKeySubmit} className="w-full">
            Save API Key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};