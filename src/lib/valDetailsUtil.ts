import type { CompanyPlan, ValDetail, ValHeader, Company } from '@/types/api';
import type { BracketMapping } from '@/types/api/BracketMapping';
import { v4 as uuidV4 } from 'uuid';
import { replaceBracketTags } from './bracketReplacer';

type ReplaceContext = {
  valHeader?: ValHeader;
  companyPlan?: CompanyPlan;
  company?: Company;
};

function stripParentPTag(html: string): string {
    return html.replace(/^<p[^>]*>(.*?)<\/p>$/is, '$1');
}

export function generateHtmlContent(details: ValDetail[]) {
    return [...details]
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        .map(detail => {
            let classString = `class="`;
            if (detail.indent && detail.indent > 0) classString += `indent-level-${detail.indent} `;
            if (detail.center) classString += `text-center `;
            if (detail.tightLineHeight) classString += `tightLineHeight `;
            if (detail.bold) classString += `font-bold `;
            if (detail.bullet) classString += `bullet `;
            classString = classString.trim() + '"';
            if(classString === 'class=""') {
                classString = '';
            } else {
                classString = ' ' + classString;
            }
            let content = detail.groupContent || '';
            content = `<p>${stripParentPTag(content)}</p>`;
            let html;
            if (content.startsWith('<')) {
                html = content.replace(
                    /<(\w+)([^>]*)>/, //NOSONAR
                    `<$1$2 data-val-details-id="${detail.valDetailsId}"${classString} data-test-id="${detail.valDetailsId}">`
                );
            } else {
                html = `<p${classString} data-val-details-id="${detail.valDetailsId}" data-test-id="${detail.valDetailsId}">${content}</p>`;
            }
            return html;
        }).join('');
}

export function parseEditorContentToDetails(htmlContent: string, existingDetails: ValDetail[], valId: number, currentGroupId: number = 0): ValDetail[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const paragraphs = Array.from(doc.body.children);
    const updatedDetails: ValDetail[] = [];
    paragraphs.forEach((elem, index) => {
        if (elem.nodeType !== Node.ELEMENT_NODE) return;
        const el = elem as HTMLElement;
        let valDetailsId = el.dataset.valDetailsId;
        if (!valDetailsId) valDetailsId = uuidV4();
        const htmlParagraph = el.outerHTML;

        // Extract formatting classes from the paragraph HTML
        const classMatch = /class=["']([^"']+)["']/.exec(htmlParagraph);
        const classString = classMatch ? classMatch[1] : '';
        // Always set flags from classes using RegExp.exec()
        const bold = /font-bold/.exec(classString) !== null;
        const bullet = /bullet/.exec(classString) !== null;
        const center = /text-center/.exec(classString) !== null;
        const tightLineHeight = /tightLineHeight/.exec(classString) !== null;
        let indent = null;
        const indentMatch = /indent-level-(\d+)/.exec(classString);
        if (indentMatch) {
            indent = Number.parseInt(indentMatch[1], 10);
        }

        // Extract text content from paragraph
        const textMatch = /^<p[^>]*>(.*?)<\/p>$/is.exec(htmlParagraph);
        const textContent = textMatch ? textMatch[1] : '';

        // Generate groupContent from flags and text
        let newClassString = '';
        if (indent && indent > 0) newClassString += `indent-level-${indent} `;
        if (center) newClassString += 'text-center ';
        if (tightLineHeight) newClassString += 'tightLineHeight ';
        if (bold) newClassString += 'font-bold ';
        if (bullet) newClassString += 'bullet ';
        newClassString = newClassString.trim();
        const groupContent = `<p class="${newClassString}" data-val-details-id="${valDetailsId}">${textContent}</p>`;

        const existingDetail = existingDetails.find(d => d.valDetailsId === valDetailsId);

        const groupId = existingDetails[0]?.groupId || currentGroupId;

        if (existingDetail) {
            updatedDetails.push({
                ...existingDetail,
                groupContent,
            });
        } else {
            // If detail not found, create a new one
            updatedDetails.push({
                valDetailsId,
                valId,
                groupId,
                displayOrder: index + 1,
                groupContent,
                bullet,
                indent,
                bold,
                center,
                blankLineAfter: null,
                tightLineHeight,
            });
        }
    });

    return updatedDetails;
}

/**
 * Replace bracket tags in text using database mappings
 * @param text - The text containing bracket tags
 * @param context - Object containing valHeader, companyPlan, company (all optional)
 * @param mappings - Array of bracket mappings from database
 * @returns Text with all bracket tags replaced
 */
export function replaceValBracketTags(
  text: string,
  context: ReplaceContext,
  mappings: BracketMapping[]
): string {
  // Build context with defaults for missing values
  const replaceContext = {
    valHeader: context.valHeader ?? {} as any,
    companyPlan: context.companyPlan ?? {} as any,
    company: context.company ?? {} as any,
  };

  return replaceBracketTags(text, replaceContext, mappings);
}