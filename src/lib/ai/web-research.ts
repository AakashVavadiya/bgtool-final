export interface SearchResultItem {
  title: string;
  snippet: string;
  url: string;
  source: string;
}

export interface WebResearchResponse {
  query: string;
  results: SearchResultItem[];
  summary: string;
}

export async function performWebSearch(query: string): Promise<WebResearchResponse> {
  const cleanQuery = query.trim();
  const results: SearchResultItem[] = [];

  // 1. DuckDuckGo Instant Answer API
  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(ddgUrl, {
      signal: AbortSignal.timeout(3500),
      headers: { "User-Agent": "KarudiAI/1.0" },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.AbstractText) {
        results.push({
          title: data.Heading || cleanQuery,
          snippet: data.AbstractText,
          url: data.AbstractURL || "https://duckduckgo.com",
          source: data.AbstractSource || "DuckDuckGo",
        });
      }
      if (Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, 3)) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.slice(0, 60),
              snippet: topic.Text,
              url: topic.FirstURL,
              source: "DuckDuckGo",
            });
          }
        }
      }
    }
  } catch {
    /* ignore timeout or network issue */
  }

  // 2. Wikipedia API Search (Authoritative encyclopedic info)
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&format=json&utf8=1&srlimit=4`;
    const res = await fetch(wikiUrl, {
      signal: AbortSignal.timeout(3500),
      headers: { "User-Agent": "KarudiAI/1.0" },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      const searchItems = data?.query?.search || [];
      for (const item of searchItems) {
        const cleanSnippet = (item.snippet || "")
          .replace(/<span class="searchmatch">/g, "")
          .replace(/<\/span>/g, "")
          .replace(/<[^>]+>/g, "");

        results.push({
          title: item.title,
          snippet: cleanSnippet,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`,
          source: "Wikipedia",
        });
      }
    }
  } catch {
    /* ignore */
  }

  // Deduplicate results
  const uniqueUrls = new Set<string>();
  const filtered = results.filter((r) => {
    if (!r.url || uniqueUrls.has(r.url)) return false;
    uniqueUrls.add(r.url);
    return true;
  });

  const summary = filtered.length > 0
    ? filtered.map((r, i) => `[${i + 1}] "${r.title}" (${r.source}): ${r.snippet} [${r.url}]`).join("\n\n")
    : "No relevant search results found for this query.";

  return {
    query: cleanQuery,
    results: filtered,
    summary,
  };
}
