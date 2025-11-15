import { Router } from 'express';
import { randomUUID } from 'crypto';
import { askRequestSchema } from '@shared/schema';
import { storage } from '../storage';
import { log } from '../utils/logger';
import { callAnthropic } from '../services/llm/claude';
import { makeAskPrompt, makeAnswerPrompt, makeKeywordExtractionPrompt } from '../services/llm/prompts';
import { getSeedNote } from './seed';
import { searchWorks } from '../services/openalex';
import { rankWorks } from '../services/ranker';
import { getCache, setCache } from '../utils/cache';
import type { OpenAlexWork } from '@shared/schema';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { question } = askRequestSchema.parse(req.body);
    const question_id = randomUUID();

    await log('info', `📝 Question: "${question}"`);

    let searchQuery = question;
    try {
      await log('info', 'Extracting search keywords...');
      const keywordPrompt = makeKeywordExtractionPrompt(question);
      const keywordResult = await callAnthropic(keywordPrompt.user, keywordPrompt.system, 1);
      
      if (keywordResult && typeof keywordResult.keywords === 'string' && keywordResult.keywords.trim()) {
        searchQuery = keywordResult.keywords.trim();
        await log('info', `Search terms: "${searchQuery}"`);
      } else {
        await log('warn', 'Keyword extraction returned invalid format, using full question');
      }
    } catch (error: any) {
      await log('warn', 'Keyword extraction failed, using full question', { error: error.message });
    }

    await log('info', 'Searching OpenAlex for academic papers...');
    
    const works = await searchWorks(searchQuery);
    const ranked = rankWorks(question, works);
    
    await log('success', `Ranked ${ranked.length} works by relevance`);

    const topN = ranked.slice(0, 6);
    await log('info', `Fetching details for top ${topN.length} works`);

    const passages = await Promise.all(
      topN.map(async (work) => {
        const cached = await getCache<OpenAlexWork>(`work:${work.id}`);
        const fullWork = cached || work;
        
        if (!cached) {
          await setCache(`work:${work.id}`, fullWork, 7200);
        }

        return {
          id: fullWork.id,
          title: fullWork.title,
          url: fullWork.url,
          passage: `${fullWork.title}\n\nAbstract: ${fullWork.abstract}`,
        };
      })
    );

    await log('info', 'Analyzing academic papers to generate answer...');
    
    const answerPrompt = makeAnswerPrompt(question, passages);
    const finalResult = await callAnthropic(answerPrompt.user, answerPrompt.system, 2);

    const conf = finalResult.confidence || 0;
    const answer = finalResult.answer || 'Unable to generate answer';
    const citations = finalResult.citations || [];
    const used_ids = topN.map(w => w.id);

    await log('success', `✅ Answer complete with ${citations.length} citations from academic papers`);

    await storage.createQA({
      question_id,
      question,
      pre_conf: 0,
      post_conf: conf,
      answer,
      citations,
      used_ids,
    });

    res.json({
      pre_conf: null,
      post_conf: conf,
      delta: 0,
      answer,
      citations,
      used_ids,
      search_results: ranked,
    });
  } catch (error: any) {
    await log('error', 'Ask endpoint failed', { error: error.message });
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
