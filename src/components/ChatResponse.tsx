import { Card } from "@/components/ui/card";

interface ChatResponseProps {
  response: string;
}

export const ChatResponse = ({ response }: ChatResponseProps) => {
  if (!response) return null;

  return (
    <Card className="p-4 mt-4">
      <h2 className="font-semibold mb-2">Response:</h2>
      <div className="whitespace-pre-wrap">{response}</div>
    </Card>
  );
};