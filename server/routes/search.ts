import { Router } from 'express';
import { searchRequestSchema } from '@shared/schema';
import { searchWorks } from '../services/openalex';
import { rankWorks } from '../services/ranker';
import { log } from '../utils/logger';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { question } = searchRequestSchema.parse(req.body);
    
    await log('info', `Search request: "${question}"`);
    
    const works = await searchWorks(question);
    const ranked = rankWorks(question, works);
    
    await log('success', `Returned ${ranked.length} ranked results`);
    
    res.json(ranked);
  } catch (error: any) {
    await log('error', 'Search endpoint failed', { error: error.message });
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
