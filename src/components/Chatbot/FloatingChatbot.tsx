import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your P2SD assistant. I can help explain KPIs, graphs, threshold breaches, and safety insights. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response (replace with actual LLM API call)
    setTimeout(() => {
      const responses: Record<string, string> = {
        pressure: "Max Pressure (psi) indicates the maximum operating pressure in the pipe. Values above 1400 psi trigger warnings. Current reading shows elevated pressure requiring monitoring.",
        temperature: "Temperature monitoring is critical for pipe integrity. High temperatures can accelerate corrosion. The system alerts when temperature exceeds 80°C.",
        corrosion: "Corrosion Impact measures the percentage of material degradation. It's calculated based on thickness loss and material properties. Values above 14% require immediate attention.",
        threshold: "Thresholds are safety limits for each metric. When exceeded, the system sends alerts to designated recipients and logs the event for compliance.",
        default: "I can provide insights on pressure, temperature, corrosion metrics, and threshold management. Ask me about any KPI or safety concern!",
      };

      const lowerInput = input.toLowerCase();
      let response = responses.default;

      if (lowerInput.includes("pressure")) response = responses.pressure;
      else if (lowerInput.includes("temperature") || lowerInput.includes("temp")) response = responses.temperature;
      else if (lowerInput.includes("corrosion")) response = responses.corrosion;
      else if (lowerInput.includes("threshold") || lowerInput.includes("alert")) response = responses.threshold;

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    }, 500);

    setInput("");
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          size="icon"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl flex flex-col">
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-semibold">P2SD Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary/80"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about metrics..."
                className="flex-1"
              />
              <Button type="submit" size="icon" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  );
};

export default FloatingChatbot;
