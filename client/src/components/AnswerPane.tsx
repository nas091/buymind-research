import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, ExternalLink, Sparkles } from "lucide-react";

interface AnswerPaneProps {
  preConfidence: number | null;
  postConfidence: number | null;
  answer: string;
  citations: Array<{ id: string; title: string; url: string }>;
  isLoading: boolean;
  stage: 'idle' | 'searching' | 'fetching' | 'answering' | 'complete';
}

export function AnswerPane({ 
  preConfidence, 
  postConfidence, 
  answer, 
  citations,
  isLoading,
  stage
}: AnswerPaneProps) {
  
  const delta = preConfidence !== null && postConfidence !== null 
    ? postConfidence - preConfidence 
    : null;

  if (stage === 'idle') {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Answer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Sparkles className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-base font-medium mb-2">Ask a question to begin</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Every question searches OpenAlex academic database to provide answers backed by research papers.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="text-lg font-semibold">Answer</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto space-y-6">
        {/* Confidence Visualization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Research Confidence</span>
            {isLoading && stage !== 'complete' && (
              <Badge variant="secondary" className="text-xs">
                {stage === 'searching' && 'Searching OpenAlex...'}
                {stage === 'fetching' && 'Fetching papers...'}
                {stage === 'answering' && 'Analyzing papers...'}
              </Badge>
            )}
          </div>

          {postConfidence !== null && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Based on Academic Papers</span>
                <span className="text-sm font-mono font-semibold" data-testid="text-post-confidence">
                  {(postConfidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${postConfidence * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Answer Text */}
        {isLoading && !answer ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-4/6"></div>
          </div>
        ) : answer ? (
          <div className="prose prose-sm max-w-none" data-testid="text-answer">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
          </div>
        ) : null}

        {/* Citations - Sources from Academic Papers */}
        {citations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-primary">
                📚 Sources from Academic Papers ({citations.length})
              </h4>
              <div className="space-y-2">
                {citations.map((citation, idx) => (
                  <a
                    key={citation.id}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`link-citation-${idx}`}
                    className="block p-3 rounded-lg border border-border hover-elevate bg-card transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                            [{idx + 1}]
                          </span>
                          <p className="text-xs font-medium leading-tight group-hover:text-primary transition-colors">
                            {citation.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 ml-6">
                          <ExternalLink className="h-3 w-3 text-primary" />
                          <span className="text-xs text-primary font-medium">
                            View Paper on OpenAlex
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
