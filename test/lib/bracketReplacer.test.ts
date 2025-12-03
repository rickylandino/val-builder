import { describe, it, expect } from 'vitest';
import { replaceBracketTags } from '@/lib/bracketReplacer';
import type { BracketMapping, BracketReplaceContext } from '@/types/api';

const baseContext = {
  valHeader: {
    "valId": 4,
    "planId": 4,
    "valDescription": "Custom VAL",
    "valDate": null,
    "planYearBeginDate": "2026-01-01T00:00:00",
    "planYearEndDate": "2026-12-31T00:00:00",
    "recipientName": null,
    "recipientAddress1": null,
    "recipientAddress2": null,
    "recipientCity": null,
    "recipientState": null,
    "recipientZip": null,
    "finalizeDate": null,
    "finalizedBy": null,
    "wordDocPath": null,
    "valstatusId": null,
    "marginLeftRight": null,
    "marginTopBottom": null,
    "fontSize": null,
    "valYear": 2026,
    "valQuarter": 1
},
  companyPlan: {
    "planId": 4,
    "companyId": 2,
    "planType": null,
    "planName": "CP4",
    "planYearEnd": "12/31",
    "tech": "RL"
}
} as BracketReplaceContext;

describe('replaceBracketTags', () => {
  it('replaces system tags with custom logic', () => {
    const mappings = [
      { tagName: 'PYE', objectPath: '', systemTag: true },
      { tagName: 'PYB', objectPath: '', systemTag: true },
      { tagName: 'PYE+3', objectPath: '', systemTag: true },
      { tagName: 'PriorYearPYE', objectPath: '', systemTag: true },
    ] as BracketMapping[];
    const text = '[[PYE]] [[PYB]] [[PYE+3]] [[PriorYearPYE]]';
    const result = replaceBracketTags(text, baseContext, mappings);
    expect(result).toMatch(/\[\[PYE: 12\/31\/2026\]\]/);
    expect(result).toMatch(/\[\[PYB: 01\/01\/2026\]\]/);
    expect(result).toMatch(/\[\[PYE\+3: 03\/31\/2027\]\]/);
    expect(result).toMatch(/\[\[PriorYearPYE: 12\/31\/2025\]\]/);
  });

  it('replaces custom tags with 1:1 mapping', () => {
    const mappings = [
      { tagName: 'Tech', objectPath: 'companyPlan.tech', systemTag: false },
      { tagName: 'Company', objectPath: 'company.name', systemTag: false },
    ] as BracketMapping[];
    const text = '[[Tech]]';
    const result = replaceBracketTags(text, baseContext, mappings);
    expect(result).toContain('[[Tech: RL]]');
  });

  it('leaves unknown system tags unchanged', () => {
    const mappings = [
      { tagName: 'UNKNOWN', objectPath: '', systemTag: true },
    ] as BracketMapping[];
    const text = '[[UNKNOWN]]';
    const result = replaceBracketTags(text, baseContext, mappings);
    expect(result).toBe('[[UNKNOWN]]');
  });

  it('handles missing values for custom tags', () => {
    const mappings = [
      { tagName: 'Missing', objectPath: 'company.missingField', systemTag: false },
    ] as BracketMapping[];
    const text = '[[Missing]]';
    const result = replaceBracketTags(text, baseContext, mappings);
    expect(result).toBe('[[Missing: ]]');
  });

  it('returns original text if no mappings match', () => {
    const mappings = [
      { tagName: 'NotPresent', objectPath: 'companyPlan.notPresent', systemTag: false },
    ] as BracketMapping[];
    const text = '[[Tech]] [[Company]]';
    const result = replaceBracketTags(text, baseContext, mappings);
    expect(result).toBe(text);
  });

  it('handles multiple occurrences of the same tag', () => {
    const mappings = [
      { tagName: 'Tech', objectPath: 'companyPlan.tech', systemTag: false },
    ] as BracketMapping[];
    const text = '[[Tech]] and again [[Tech]]';
    const result = replaceBracketTags(text, baseContext, mappings);
    expect(result).toBe('[[Tech: RL]] and again [[Tech: RL]]');
  });
});
