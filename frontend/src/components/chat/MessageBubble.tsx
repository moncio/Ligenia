
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
}

const MessageBubble = ({ message, isUser, timestamp }: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        <p className="text-sm md:text-base whitespace-pre-wrap">{message}</p>
        {timestamp && (
          <p className={cn("text-xs mt-1", isUser ? "text-primary-foreground/80" : "text-muted-foreground")}>
            {timestamp.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
