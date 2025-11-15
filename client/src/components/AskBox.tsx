import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";

interface AskBoxProps {
  onAsk: (question: string) => void;
  isLoading: boolean;
  hasError: boolean;
}

export function AskBox({ onAsk, isLoading, hasError }: AskBoxProps) {
  const [question, setQuestion] = useState("");
  const [lastSubmitted, setLastSubmitted] = useState("");
  const charCount = question.length;

  useEffect(() => {
    if (!isLoading && lastSubmitted && !hasError) {
      setQuestion("");
      setLastSubmitted("");
    }
  }, [isLoading, lastSubmitted, hasError]);

  const handleSubmit = () => {
    if (question.trim() && !isLoading) {
      setLastSubmitted(question.trim());
      onAsk(question.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-3">
          <div>
            <label htmlFor="question-input" className="text-sm font-medium text-foreground mb-2 block">
              Ask a Research Question
            </label>
            <Textarea
              id="question-input"
              data-testid="input-question"
              placeholder="e.g., What are the latest developments in quantum computing error correction?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="min-h-[120px] text-sm resize-none"
              rows={5}
            />
          </div>
          
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {charCount > 0 && `${charCount} characters`}
              {charCount === 0 && "Cmd/Ctrl + Enter to submit"}
            </span>
            <Button
              data-testid="button-ask"
              onClick={handleSubmit}
              disabled={!question.trim() || isLoading}
              className="gap-2"
            >
              {isLoading ? "Thinking..." : "Ask"}
              {!isLoading && <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
