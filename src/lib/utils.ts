import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const highlightChevrons = (html: string, addBracketHighlight = false) => {
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

    if (addBracketHighlight) {
        cleanHtml = highlightBrackets(cleanHtml);
    }
    
    return cleanHtml;
};

export function highlightBrackets(text: string): string {
  // This regex matches [[...]] and captures the content inside
  return text.replaceAll(/\[\[(.+?)\]\]/g, '<span class="highlight-bracket">[[$1]]</span>'); //NOSONAR
}

export const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
};

export const formatAsAmericanDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatRelativeDate = (dateString: string) => {
    if (dateString === null) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};