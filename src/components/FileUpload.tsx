import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadProps {
  mode: string;
  onFileContent: (content: string) => void;
}

export const FileUpload = ({ mode, onFileContent }: FileUploadProps) => {
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "text/plain" || file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result;
          if (typeof text === "string") {
            onFileContent(text);
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

  if (mode !== "translate" && mode !== "summarize") return null;

  return (
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
  );
};