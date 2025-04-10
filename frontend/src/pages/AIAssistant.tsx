import React, { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import SuggestionButton from "@/components/chat/SuggestionButton";
import { Sparkles, Calendar, Trophy, Key } from "lucide-react";

// Interface for chat messages
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

// Generate a random ID for messages
const generateId = () => Math.random().toString(36).substring(2, 9);

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message in Spanish
  useEffect(() => {
    setMessages([{
      id: "1",
      content: "Soy el asistente virtual de LIGENIA. ¿En qué puedo ayudarte hoy?",
      role: "assistant",
      timestamp: new Date(),
    }]);
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle user input submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: generateId(),
        content: getSimulatedResponse(inputValue),
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestionText: string) => {
    setInputValue(suggestionText);
    
    // Submit the suggestion automatically
    const userMessage: Message = {
      id: generateId(),
      content: suggestionText,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: generateId(),
        content: getSimulatedResponse(suggestionText),
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Updated simulated response function with static Spanish responses
  const getSimulatedResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes("torneo") || lowerInput.includes("inscrib")) {
      return "Para inscribirte en un torneo, dirígete a la sección 'Torneos' en el menú principal. Allí podrás ver todos los torneos disponibles y sus fechas. Para inscribirte, selecciona el torneo que te interese y haz clic en 'Inscribirse'. Deberás completar un formulario con tus datos y realizar el pago correspondiente.";
    } else if (lowerInput.includes("ranking") || lowerInput.includes("sistema")) {
      return "El sistema de ranking se basa en los puntos obtenidos en los torneos oficiales. Los puntos se asignan según la ronda alcanzada y la categoría del torneo. Al final de cada temporada, se actualiza el ranking general y se determinan las categorías para la siguiente temporada.";
    } else if (lowerInput.includes("nivel") || lowerInput.includes("habilidad") || lowerInput.includes("exist")) {
      return "Existen 6 niveles de juego en nuestro sistema: Principiante (1), Intermedio Bajo (2), Intermedio (3), Intermedio Alto (4), Avanzado (5) y Profesional (6). Tu nivel se determina por tu rendimiento en los torneos y puede subir o bajar según tus resultados.";
    } else {
      return "No tengo información específica sobre esa consulta. ¿Puedes reformularla o preguntar sobre torneos, el sistema de ranking o los niveles de juego?";
    }
  };

  // Suggestions in Spanish
  const suggestions = [
    {
      text: "¿Cómo me inscribo en un torneo?",
      icon: <Calendar className="h-4 w-4 mr-2" />,
    },
    {
      text: "¿Cómo funciona el sistema de ranking?",
      icon: <Trophy className="h-4 w-4 mr-2" />,
    },
    {
      text: "¿Qué niveles de juego existen?",
      icon: <Key className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <header className="bg-background border-b border-border py-4 px-6 flex items-center">
          <h1 className="text-xl font-semibold text-foreground flex items-center">
            Asistente Virtual
            <Sparkles className="ml-2 h-5 w-5 text-primary" />
          </h1>
        </header>

        {/* Chat container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background/50">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message.content}
                  isUser={message.role === "user"}
                  timestamp={message.timestamp}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4 shadow-sm max-w-[80%]">
                    <div className="animate-pulse flex space-x-2">
                      <div className="h-2 w-2 bg-muted-foreground/30 rounded-full"></div>
                      <div className="h-2 w-2 bg-muted-foreground/30 rounded-full"></div>
                      <div className="h-2 w-2 bg-muted-foreground/30 rounded-full"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div className="mt-6 mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Preguntas sugeridas:</h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <SuggestionButton
                    key={index}
                    text={suggestion.text}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    icon={suggestion.icon}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="bg-background border-t border-border p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onSubmit={handleSubmit}
              placeholder="Escribe tu pregunta..."
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;
