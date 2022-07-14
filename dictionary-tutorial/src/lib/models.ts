export interface License {
  name: string;
  url: string;
}

export interface Phonetic {
  audio: string;
  sourceUrl: string;
  license: License;
  text: string;
}

export interface Definition {
  definition: string;
  synonyms: any[];
  antonyms: any[];
  example?: string;
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

export interface WordData {
  word: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  license: License;
  sourceUrls: string[];
}

export interface GroupedDefinition {
  word: string;
  phonetic: Phonetic | undefined;
  partOfSpeech: string;
  meanings: Meaning[];
}
