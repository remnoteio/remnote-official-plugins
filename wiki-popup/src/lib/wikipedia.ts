export const tryCreateWikiExtractURL = (url: string): string | null => {
  if (!isWikiURL(url)) {
    return null;
  }
  const language = parseLanguageFromUrl(url);
  const article = parseArticleFromUrl(url);
  return language && url
    ? `https://${language}.wikipedia.org/api/rest_v1/page/summary/${article}`
    : null;
};

const isWikiURL = (url: string) => {
  try {
    return new URL(url)?.hostname?.split(".")?.[1] === "wikipedia";
  } catch {
    return null;
  }
};

const parseLanguageFromUrl = (url: string): string | null => {
  try {
    const lang = new URL(url)?.hostname?.split(".")?.[0];
    return lang && lang.length > 0 ? lang : null;
  } catch {
    return null;
  }
};

const parseArticleFromUrl = (url: string): string | null => {
  try {
    const article = new URL(url)?.pathname.replace("/wiki/", "").trim();
    return article && article.length > 0 ? article : null;
  } catch {
    return null;
  }
};
