import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AskBox } from "@/components/AskBox";
import { LibraryPanel } from "@/components/LibraryPanel";
import { AnswerPane } from "@/components/AnswerPane";
import { LogStream } from "@/components/LogStream";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Log, RankedWork } from "@shared/schema";

interface AskResponse {
  pre_conf: number;
  post_conf: number;
  delta: number;
  answer: string;
  citations: Array<{ id: string; title: string; url: string }>;
  used_ids?: string[];
  search_results?: RankedWork[];
}

type Stage = 'idle' | 'searching' | 'fetching' | 'answering' | 'complete';

function deriveStageFromLogs(logs: Log[]): Stage {
  if (logs.length === 0) return 'idle';
  
  const stageOrder: Stage[] = ['idle', 'searching', 'fetching', 'answering', 'complete'];
  let highestStage: Stage = 'idle';
  let highestLevel = 0;
  
  for (const log of logs) {
    const message = log.message;
    let detectedStage: Stage | null = null;
    
    if (
      message.includes('📝 Question:') ||
      message.includes('Searching OpenAlex for academic papers')
    ) {
      detectedStage = 'searching';
    } else if (
      message.includes('OpenAlex search:') ||
      (message.includes('Found') && message.includes('works from OpenAlex'))
    ) {
      detectedStage = 'searching';
    } else if (message.includes('Ranked') && message.includes('works by relevance')) {
      detectedStage = 'searching';
    } else if (message.includes('Fetching details for top')) {
      detectedStage = 'fetching';
    } else if (
      message.includes('Analyzing academic papers') ||
      message.includes('Calling Claude')
    ) {
      detectedStage = 'answering';
    } else if (
      message.includes('✅ Answer complete') ||
      message.includes('Claude response parsed successfully')
    ) {
      detectedStage = 'complete';
    } else if (log.level === 'warn' && message.includes('Claude attempt')) {
      // Retry warning - keep current stage
    } else if (
      log.level === 'error' && (
        message.includes('failed') ||
        message.includes('All Claude attempts failed') ||
        message.includes('OpenAlex search failed') ||
        message.includes('Failed to fetch work')
      )
    ) {
      detectedStage = 'complete';
    }
    
    if (detectedStage) {
      const detectedLevel = stageOrder.indexOf(detectedStage);
      if (detectedLevel > highestLevel) {
        highestLevel = detectedLevel;
        highestStage = detectedStage;
      }
    }
  }
  
  return highestStage;
}

export default function Home() {
  const { toast } = useToast();
  const [localLogs, setLocalLogs] = useState<Log[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<AskResponse | null>(null);
  const [questionStart, setQuestionStart] = useState<number>(0);

  const { data: serverLogs = [] } = useQuery<Log[]>({
    queryKey: ['/api/logs'],
    refetchInterval: 2000,
  });

  useEffect(() => {
    setLocalLogs(serverLogs);
  }, [serverLogs]);

  const logsForCurrentQuestion = serverLogs.filter(log => log.id > questionStart);
  const stage = deriveStageFromLogs(logsForCurrentQuestion);

  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      setCurrentAnswer(null);
      const lastLogId = serverLogs.length > 0 ? serverLogs[serverLogs.length - 1].id : 0;
      setQuestionStart(lastLogId);
      
      const response = await apiRequest<AskResponse>('POST', '/api/ask', { question });
      return response;
    },
    onSuccess: (data) => {
      setCurrentAnswer(data);
      toast({
        title: "Answer generated from research",
        description: `${data.citations.length} academic papers analyzed`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get answer",
        variant: "destructive",
      });
    },
  });

  const handleClearLogs = () => {
    setLocalLogs([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                BuyMind Research
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-Powered Academic Research Assistant
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  askMutation.isPending ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                }`} />
                <span className="text-sm text-muted-foreground">
                  {askMutation.isPending ? 'Analyzing' : 'Ready'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <AskBox 
              onAsk={(q) => askMutation.mutate(q)} 
              isLoading={askMutation.isPending}
              hasError={askMutation.isError}
            />
            <LibraryPanel
              results={currentAnswer?.search_results || []}
              selectedIds={currentAnswer?.used_ids || []}
              isLoading={stage === 'searching' || stage === 'fetching'}
            />
          </div>

          <div className="lg:col-span-2">
            <AnswerPane
              preConfidence={currentAnswer?.pre_conf ?? null}
              postConfidence={currentAnswer?.post_conf ?? null}
              answer={currentAnswer?.answer || ''}
              citations={currentAnswer?.citations || []}
              isLoading={askMutation.isPending}
              stage={stage}
            />
          </div>

          <div className="lg:col-span-1">
            <LogStream 
              logs={localLogs}
              onClear={handleClearLogs}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
