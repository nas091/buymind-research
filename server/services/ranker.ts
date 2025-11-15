import natural from 'natural';
import type { OpenAlexWork, RankedWork } from '@shared/schema';

const TfIdf = natural.TfIdf;

export function rankWorks(query: string, works: OpenAlexWork[]): RankedWork[] {
  if (works.length === 0) return [];

  const tfidf = new TfIdf();
  
  works.forEach((work) => {
    const text = `${work.title} ${work.abstract}`.toLowerCase();
    tfidf.addDocument(text);
  });

  const scores: Array<{ work: OpenAlexWork; score: number }> = [];
  const queryLower = query.toLowerCase();

  works.forEach((work, idx) => {
    let score = 0;
    tfidf.tfidfs(queryLower, (i: number, measure: number) => {
      if (i === idx) {
        score = measure;
      }
    });
    scores.push({ work, score });
  });

  scores.sort((a, b) => b.score - a.score);

  return scores.map(({ work, score }) => ({
    ...work,
    score: Math.max(0, Math.min(1, score / 10)),
  }));
}
