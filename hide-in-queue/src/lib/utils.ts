import * as Re from 'remeda';
import {Rem, RichTextInterface} from '@remnote/plugin-sdk';

// Get all text from the Rem including both its text and back text
// and add it all to one RichTextInterface array.

export const allRemText = (rem: Rem): RichTextInterface => {
  return Re.compact([...(rem?.text || []), " ", ...(rem?.backText || []), " "]);
};
