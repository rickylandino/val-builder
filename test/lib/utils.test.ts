import { describe, it, expect } from 'vitest';
import { cn, isCompany, isValSection, isValHeader } from '@/lib/utils';

describe('Type guards', () => {
    describe('isCompany', () => {
        it('returns true for valid Company', () => {
            expect(isCompany({ companyId: 123 })).toBe(true);
        });
        it('returns false for invalid Company', () => {
            expect(isCompany({ companyId: 'abc' })).toBe(false);
            expect(isCompany({})).toBe(false);
            expect(isCompany(null)).toBe(false);
            expect(isCompany(undefined)).toBe(false);
        });
    });

    describe('isValSection', () => {
        it('returns true for valid ValSection', () => {
            expect(isValSection({ groupId: 456 })).toBe(true);
        });
        it('returns false for invalid ValSection', () => {
            expect(isValSection({ groupId: 'def' })).toBe(false);
            expect(isValSection({})).toBe(false);
            expect(isValSection(null)).toBe(false);
            expect(isValSection(undefined)).toBe(false);
        });
    });

    describe('isValHeader', () => {
        it('returns true for valid ValHeader', () => {
            expect(isValHeader({ valId: 789 })).toBe(true);
        });
        it('returns false for invalid ValHeader', () => {
            expect(isValHeader({ valId: 'ghi' })).toBe(false);
            expect(isValHeader({})).toBe(false);
            expect(isValHeader(null)).toBe(false);
            expect(isValHeader(undefined)).toBe(false);
        });
    });

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
