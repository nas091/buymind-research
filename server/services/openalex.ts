import axios from 'axios';
import type { OpenAlexWork } from '@shared/schema';
import { log } from '../utils/logger';

const OPENALEX_BASE = 'https://api.openalex.org';
const MAILTO = process.env.OPENALEX_MAILTO || 'alfarhan058@gmail.com';

const client = axios.create({
  baseURL: OPENALEX_BASE,
  timeout: 8000,
  params: { mailto: MAILTO },
});

function reconstructAbstract(invertedIndex: Record<string, number[]> | null): string {
  if (!invertedIndex) return '';
  
  try {
    const words: [string, number][] = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
      for (const pos of positions) {
        words.push([word, pos]);
      }
    }
    words.sort((a, b) => a[1] - b[1]);
    return words.map(w => w[0]).join(' ').slice(0, 500);
  } catch {
    return '';
  }
}

export async function searchWorks(query: string): Promise<OpenAlexWork[]> {
  try {
    await log('info', `OpenAlex search: "${query}"`);
    
    const response = await client.get('/works', {
      params: {
        search: query,
        per_page: 10,
        mailto: MAILTO,
      },
    });

    const results = response.data.results || [];
    await log('success', `Found ${results.length} works from OpenAlex`);
    
    return results.map((work: any) => normalizeWork(work));
  } catch (error: any) {
    await log('error', 'OpenAlex search failed', { error: error.message });
    throw new Error('Failed to search OpenAlex');
  }
}

export async function getWork(id: string): Promise<OpenAlexWork> {
  try {
    const response = await client.get(`/works/${id}`, {
      params: { mailto: MAILTO },
    });
    return normalizeWork(response.data);
  } catch (error: any) {
    await log('error', `Failed to fetch work ${id}`, { error: error.message });
    throw new Error('Failed to fetch work details');
  }
}

function normalizeWork(raw: any): OpenAlexWork {
  const abstract = reconstructAbstract(raw.abstract_inverted_index);
  const authors = (raw.authorships || [])
    .slice(0, 10)
    .map((a: any) => ({
      name: a.author?.display_name || 'Unknown',
    }));

  const primaryLocation = raw.primary_location || raw.locations?.[0] || {};
  const url = primaryLocation.landing_page_url || raw.id || '';

  return {
    id: raw.id,
    title: raw.title || 'Untitled',
    abstract,
    year: raw.publication_year || 0,
    authors,
    url,
    source: 'openalex',
  };
}
