
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface SuggestionButtonProps {
  text: string;
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const SuggestionButton = ({ text, onClick, icon, className }: SuggestionButtonProps) => {
  return (
    <Button
      variant="outline"
      className={cn("text-xs md:text-sm mb-2 mr-2 whitespace-normal h-auto py-2 flex items-center", className)}
      onClick={onClick}
    >
      {icon}
      {text}
    </Button>
  );
};

export default SuggestionButton;
