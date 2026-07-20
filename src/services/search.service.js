import { config } from '../config/index.js';

export async function searchWeb(query) {
  const { apiKey, searchEngineId } = config.googleSearch;

  if (!apiKey || apiKey === 'your_google_search_api_key_here' || !searchEngineId) {
    throw new Error('SEARCH_UNAVAILABLE');
  }

  const url = 'https://www.googleapis.com/customsearch/v1';
  const params = new URLSearchParams({
    key: apiKey,
    cx: searchEngineId,
    q: query,
    num: '5',
    hl: 'en',
  });

  const response = await fetch(`${url}?${params}`, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Search API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    return [];
  }

  return data.items.map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
    source: new URL(item.link).hostname,
  }));
}

export function formatSearchResultsForPrompt(results, query) {
  if (!results || results.length === 0) {
    return '';
  }

  const formatted = results
    .map(
      (r, i) =>
        `[Source ${i + 1}] ${r.title}\nURL: ${r.link}\n${r.snippet}`
    )
    .join('\n\n');

  return `Web search results for "${query}":\n\n${formatted}\n\nPlease provide a comprehensive answer based on these search results, citing sources where appropriate.`;
}

export async function searchWithFallback(query) {
  try {
    const results = await searchWeb(query);
    if (results.length > 0) {
      return { results, source: 'web' };
    }
    return { results: [], source: 'ai' };
  } catch (error) {
    if (error.message === 'SEARCH_UNAVAILABLE') {
      return { results: [], source: 'ai' };
    }
    throw error;
  }
}
