import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import type { Log } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface LogStreamProps {
  logs: Log[];
  onClear: () => void;
}

const levelColors = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  error: 'bg-red-500',
  warn: 'bg-yellow-500',
};

export function LogStream({ logs, onClear }: LogStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLogsLengthRef = useRef(logs.length);

  useEffect(() => {
    if (logs.length > prevLogsLengthRef.current) {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
    prevLogsLengthRef.current = logs.length;
  }, [logs.length]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Activity Log</CardTitle>
          {logs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              data-testid="button-clear-logs"
              className="h-8 gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[500px]" ref={scrollRef}>
          <div className="px-6 pb-4 space-y-2">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">
                  No activity yet
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  data-testid={`log-${log.id}`}
                  className="flex items-start gap-2 p-2 rounded text-xs font-mono animate-in fade-in duration-200"
                >
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${levelColors[log.level]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(log.ts), { addSuffix: true })}
                      </span>
                      <span className={`uppercase text-[10px] font-semibold ${
                        log.level === 'error' ? 'text-red-600' :
                        log.level === 'warn' ? 'text-yellow-600' :
                        log.level === 'success' ? 'text-green-600' :
                        'text-blue-600'
                      }`}>
                        {log.level}
                      </span>
                    </div>
                    <p className="text-foreground break-words">
                      {log.message}
                    </p>
                    {log.meta && Object.keys(log.meta).length > 0 && (
                      <pre className="mt-1 text-[10px] text-muted-foreground overflow-x-auto">
                        {JSON.stringify(log.meta, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
