export function makeAskPrompt(question: string, seed: string): { system: string; user: string } {
  return {
    system: "You are a precise research assistant. If information is missing, say we need more data. Always return VALID JSON only with this exact format: {\"answer\":\"...\",\"confidence\":0.0-1.0}",
    user: `Seed:\n${seed}\n\nQuestion:\n${question}\n\nReturn JSON only.`,
  };
}

export function makeKeywordExtractionPrompt(question: string): { system: string; user: string } {
  return {
    system: "You are a research librarian who extracts key academic search terms. Return VALID JSON only with this exact format: {\"keywords\":\"...\"}. The keywords field should contain 3-5 key academic terms separated by spaces, optimized for academic database search.",
    user: `Extract the most important academic search terms from this question. Focus on technical terminology, concepts, and field-specific vocabulary that would appear in academic paper titles and abstracts.\n\nQuestion: ${question}\n\nReturn JSON with a single keywords string containing 3-5 terms separated by spaces.`,
  };
}

export function makeAnswerPrompt(
  question: string, 
  passages: Array<{ id: string; title: string; url: string; passage: string }>
): { system: string; user: string } {
  const formattedPassages = passages
    .map((p, idx) => `[${idx + 1}] ID: ${p.id}\nTitle: ${p.title}\nURL: ${p.url}\n${p.passage}`)
    .join('\n\n---\n\n');

  return {
    system: "You are a precise research assistant analyzing academic papers. Use ONLY the supplied passages to answer the question. You MUST cite the papers you use in your answer. Return JSON only with this exact format: {\"answer\":\"...\",\"citations\":[{\"id\":\"...\",\"title\":\"...\",\"url\":\"...\"}],\"confidence\":0.0-1.0}. Include ALL papers you reference in the citations array.",
    user: `Question:\n${question}\n\nAcademic Papers:\n${formattedPassages}\n\nAnalyze these papers and provide a comprehensive answer with citations. Return JSON exactly as specified.`,
  };
}
