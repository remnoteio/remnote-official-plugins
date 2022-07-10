import { WordData } from "./models";

// In this plugin we are using a free dictionary API service.
// Note: this particular dictionary API only works with English.
// Read more about it here: https://dictionaryapi.dev/

export const apiBaseUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";
export const getDataFromResponse = (d: WordData[] | null): WordData | null =>
  Array.isArray(d) ? d[0] : null;
