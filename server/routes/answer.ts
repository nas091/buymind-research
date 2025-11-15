import { Router } from 'express';
import { answerRequestSchema } from '@shared/schema';
import { callAnthropic } from '../services/llm/claude';
import { makeAnswerPrompt } from '../services/llm/prompts';
import { log } from '../utils/logger';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { question, passages } = answerRequestSchema.parse(req.body);
    
    await log('info', `Answer request with ${passages.length} passages`);
    
    const prompt = makeAnswerPrompt(question, passages);
    const result = await callAnthropic(prompt.user, prompt.system, 2);
    
    await log('success', 'Answer generated successfully');
    
    res.json(result);
  } catch (error: any) {
    await log('error', 'Answer endpoint failed', { error: error.message });
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
