import { describe, expect, it } from 'vitest';

import { fuzzyMatch } from '../src/app/_shared/components/cabinet/fuzzy';

describe('fuzzyMatch', () => {
  it('matches English characters in order', () => {
    expect(fuzzyMatch('pbzk', 'Public Zettelkasten')).not.toBeNull();
    expect(fuzzyMatch('pbzk', 'Public Notes')).toBeNull();
  });

  it('matches Korean choseong queries', () => {
    expect(fuzzyMatch('ㅋㅁㅅ', '크리스마스')).not.toBeNull();
    expect(fuzzyMatch('ㅋㅁㅅ', '크리스')).toBeNull();
  });

  it('matches Korean syllables while omitting final consonants', () => {
    expect(fuzzyMatch('고라', '골라')).not.toBeNull();
    expect(fuzzyMatch('고라', '가라')).toBeNull();
  });

  it('matches mixed complete syllables and choseong', () => {
    expect(fuzzyMatch('군ㄱㅁ', '군고구마')).not.toBeNull();
    expect(fuzzyMatch('감ㄱㅁ', '군고구마')).toBeNull();
  });
});
