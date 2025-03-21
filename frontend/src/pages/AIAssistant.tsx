
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

// Sample initial messages
const initialMessages: Message[] = [
  {
    id: "1",
    content: "¡Hola! Soy el asistente virtual de LIGENIA. ¿En qué puedo ayudarte hoy?",
    role: "assistant",
    timestamp: new Date(),
  },
];

// Updated suggestions
const suggestions = [
  {
    text: "¿Cómo me inscribo a un torneo?",
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

// Generate a random ID for messages
const generateId = () => Math.random().toString(36).substring(2, 9);

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Updated simulated response function with the corrected information
  const getSimulatedResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes("inscribo") || lowerInput.includes("torneo")) {
      return "Para inscribirte a un torneo, debes seguir estos pasos:\n\n1. Inicia sesión en tu cuenta de LIGENIA\n2. Ve a la sección 'Torneos' en el menú principal\n3. Selecciona el torneo al que deseas inscribirte\n4. Haz clic en el botón 'Inscribirse'\n5. Completa el formulario con tus datos\n6. Realiza el pago de la inscripción si es necesario\n7. Recibirás un correo de confirmación con los detalles del torneo";
    } else if (lowerInput.includes("ranking") || lowerInput.includes("sistema")) {
      return "El sistema de ranking funciona de la siguiente manera:\n\n- Los puntos se asignan según la categoría del torneo (P1, P2 o P3)\n- Los torneos P1 otorgan más puntos que los P2, y estos más que los P3\n- También obtienes más puntos según la ronda a la que llegues en el torneo\n- Por ejemplo, ganar un torneo P1 otorga significativamente más puntos que ganar un torneo P3\n- Tu ranking se calcula sumando los puntos obtenidos en los últimos 12 meses\n- Esto determina tu posición en la clasificación general";
    } else if (lowerInput.includes("nivel") || lowerInput.includes("juego") || lowerInput.includes("existen")) {
      return "En LIGENIA utilizamos 3 niveles de juego según la habilidad del jugador:\n\n- P1 → Avanzado (nivel 4, 4.5 y 5): Jugadores con técnica refinada y estrategia avanzada\n- P2 → Intermedio (nivel 3, 3.5 y 4): Jugadores con buena técnica y táctica consistente\n- P3 → Principiante (nivel 1, 2 y 2.5): Jugadores con poca experiencia o habilidades básicas\n\nEsto nos permite crear emparejamientos más justos y competitivos en los torneos.";
    } else {
      return "Gracias por tu pregunta. Nuestro equipo está trabajando para mejorar mis respuestas. Mientras tanto, ¿puedo ayudarte con información sobre cómo inscribirte a un torneo, el sistema de ranking o los niveles de juego que existen?";
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center">
            Asistente Virtual
            <Sparkles className="ml-2 h-5 w-5 text-blue-500" />
          </h1>
        </header>

        {/* Chat container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
                  <div className="bg-white rounded-lg p-4 shadow-sm max-w-[80%]">
                    <div className="animate-pulse flex space-x-2">
                      <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                      <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                      <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div className="mt-6 mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Preguntas sugeridas:</h3>
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
        <div className="bg-white border-t border-gray-200 p-4">
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
