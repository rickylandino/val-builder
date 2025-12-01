import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Type guards', () => {
    describe('cn utility', () => {
        it('merges class names', () => {
            expect(cn('foo', 'bar')).toBe('foo bar');
        });
        it('handles conditional classes', () => {
            expect(cn('foo', undefined, null, 'baz')).toBe('foo baz');
        });
        it('handles array input', () => {
            expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
        });
    });
});
