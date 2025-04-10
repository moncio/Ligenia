
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

type NextButtonProps = {
  onClick: () => void
  disabled: boolean
  className?: string
}

export const NextButton: React.FC<NextButtonProps> = (props) => {
  const { onClick, disabled, className = '' } = props

  return (
    <Button
      variant="outline"
      size="icon"
      className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm z-10 rounded-full shadow-md border-0 mr-1 md:mr-2 w-8 h-8 md:w-10 md:h-10 hover:bg-white hidden md:flex ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
      <span className="sr-only">Next</span>
    </Button>
  )
}
