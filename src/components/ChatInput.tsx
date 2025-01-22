import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2 } from "lucide-react";

interface ChatInputProps {
  message: string;
  isLoading: boolean;
  isKeySet: boolean;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
}

export const ChatInput = ({
  message,
  isLoading,
  isKeySet,
  onMessageChange,
  onSubmit,
}: ChatInputProps) => {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Enter your message..."
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        className="min-h-[100px]"
      />

      <Button
        onClick={onSubmit}
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
    </div>
  );
};