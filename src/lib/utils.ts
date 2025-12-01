import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const highlightChevrons = (html: string) => {
    if (!html) return '';
    // Remove any existing chevron-placeholder spans
    let cleanHtml = html.replaceAll(/<span class="chevron-placeholder"[^>]*>(.*?)<\/span>/g, '$1');
    // Replace both HTML entities and raw chevrons
      cleanHtml = cleanHtml
        .replaceAll(/(&lt;&lt;|&#60;&#60;|&#x3C;&#x3C;|<<)\s*([\s\S]*?)\s*(&gt;&gt;|&#62;&#62;|&#x3E;&#x3E;|>>)/g, (_, open, content, close) => { //NOSONAR
          return `<span class="chevron-placeholder font-bold text-primary-foreground bg-primary px-1 rounded" data-chevron-placeholder="true">${open} ${content} ${close}</span>`;
        })
        .replaceAll(/(<<)\s*([\s\S]*?)\s*(>>)/g, (_, open, content, close) => { //NOSONAR
          return `<span class="chevron-placeholder font-bold text-primary-foreground bg-primary px-1 rounded" data-chevron-placeholder="true">${open} ${content} ${close}</span>`;
        });
    return cleanHtml;
};