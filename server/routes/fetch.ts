import { Router } from 'express';
import { fetchRequestSchema } from '@shared/schema';
import { getWork } from '../services/openalex';
import { getCache, setCache } from '../utils/cache';
import { log } from '../utils/logger';
import type { OpenAlexWork } from '@shared/schema';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { ids } = fetchRequestSchema.parse(req.body);
    
    await log('info', `Fetch request for ${ids.length} works`);
    
    const results = await Promise.all(
      ids.map(async (id) => {
        const cached = await getCache<OpenAlexWork>(`work:${id}`);
        if (cached) {
          return {
            id: cached.id,
            title: cached.title,
            url: cached.url,
            passage: `${cached.title}\n\nAbstract: ${cached.abstract}`,
          };
        }
        
        const work = await getWork(id);
        await setCache(`work:${id}`, work, 7200);
        
        return {
          id: work.id,
          title: work.title,
          url: work.url,
          passage: `${work.title}\n\nAbstract: ${work.abstract}`,
        };
      })
    );
    
    await log('success', `Fetched ${results.length} work details`);
    
    res.json(results);
  } catch (error: any) {
    await log('error', 'Fetch endpoint failed', { error: error.message });
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
