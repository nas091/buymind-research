import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, BookOpen } from "lucide-react";
import type { RankedWork } from "@shared/schema";

interface LibraryPanelProps {
  results: RankedWork[];
  selectedIds: string[];
  isLoading: boolean;
}

export function LibraryPanel({ results, selectedIds, isLoading }: LibraryPanelProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">OpenAlex Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">OpenAlex Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Search results will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg font-semibold">
          OpenAlex Results ({results.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[400px] px-6 pb-4">
          <div className="space-y-3">
            {results.map((work) => {
              const isSelected = selectedIds.includes(work.id);
              return (
                <div
                  key={work.id}
                  data-testid={`result-${work.id}`}
                  className={`p-3 rounded-lg border transition-colors ${
                    isSelected 
                      ? 'bg-accent border-primary' 
                      : 'border-border hover-elevate'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-medium leading-tight flex-1">
                      {work.title}
                    </h4>
                    {work.year && (
                      <Badge variant="secondary" className="flex-shrink-0 text-xs">
                        {work.year}
                      </Badge>
                    )}
                  </div>
                  
                  {work.authors && work.authors.length > 0 && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {work.authors.slice(0, 3).map(a => a.name).join(', ')}
                      {work.authors.length > 3 && ' et al.'}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="text-xs text-muted-foreground">
                        Relevance:
                      </div>
                      <div className="flex-1 max-w-[100px] h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(work.score * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
                        {work.score.toFixed(2)}
                      </span>
                    </div>
                    
                    {work.url && (
                      <a
                        href={work.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`link-${work.id}`}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-primary/20">
                      <Badge variant="default" className="text-xs">
                        ✓ Used in answer
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
