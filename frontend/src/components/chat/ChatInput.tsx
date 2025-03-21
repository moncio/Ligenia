
import { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  isLoading?: boolean;
}

const ChatInput = ({ value, onChange, onSubmit, placeholder, isLoading = false }: ChatInputProps) => {
  const { translations } = useLanguage();
  
  return (
    <form onSubmit={onSubmit} className="flex w-full gap-2">
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder || translations.askQuestion}
        disabled={isLoading}
        className="flex-1"
      />
      <Button 
        type="submit" 
        disabled={isLoading || !value.trim()} 
        className="shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInput;
