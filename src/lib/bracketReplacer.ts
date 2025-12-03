import get from 'lodash/get';
import type { BracketMapping } from '@/types/api/BracketMapping';
import type { BracketReplaceContext } from '@/types/api/BracketMappingFields';

// Helper functions for date manipulation
function formatDate(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// System tag handlers with custom logic
const systemTagHandlers: Record<string, (ctx: BracketReplaceContext) => string> = {
  PYE: ctx => `[[PYE: ${formatDate(ctx.valHeader?.planYearEndDate ?? null)}]]`,
  'PYE+3': ctx => {
    const endDate = ctx.valHeader?.planYearEndDate ? new Date(ctx.valHeader.planYearEndDate) : null;
    return `[[PYE+3: ${formatDate(endDate ? addMonths(endDate, 3) : null)}]]`;
  },
  PriorYearPYE: ctx => {
    const beginDate = ctx.valHeader?.planYearBeginDate
      ? new Date(ctx.valHeader.planYearBeginDate)
      : null;
    return `[[PriorYearPYE: ${formatDate(beginDate ? addDays(beginDate, -1) : null)}]]`;
  },
  PYB: ctx => `[[PYB: ${formatDate(ctx.valHeader?.planYearBeginDate ?? null)}]]`,
  // Add more system tag handlers as needed
};

/**
 * Replace bracket tags in text with values from context using custom mappings
 * @param text - The text containing bracket tags like [[TagName]]
 * @param context - Object containing valHeader, companyPlan, company
 * @param mappings - Array of bracket mappings from database (both system and custom)
 * @returns Text with all bracket tags replaced with their values
 */
export function replaceBracketTags(
  text: string,
  context: BracketReplaceContext,
  mappings: BracketMapping[]
): string {
  let result = text;

  mappings.forEach(mapping => {
    const tag = `[[${mapping.tagName}]]`;
    if (result.includes(tag)) {
      let replacement = '';

      if (mapping.systemTag) {
        // System tags use custom logic handlers (already include brackets)
        const handler = systemTagHandlers[mapping.tagName];
        if (handler) {
          replacement = handler(context);
        } else {
          console.warn(`No handler found for system tag: ${mapping.tagName}`);
          replacement = tag; // Keep original tag if no handler found
        }
      } else {
        // Custom tags use simple 1:1 mapping from objectPath (wrap in brackets with value)
        const value = String(get(context, mapping.objectPath, '') || '');
        replacement = `[[${mapping.tagName}: ${value}]]`;
      }

      result = result.replaceAll(tag, replacement);
    }
  });

  return result;
}
