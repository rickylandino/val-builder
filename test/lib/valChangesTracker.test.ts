import { calculateChanges, aggregateAllChanges } from '@/lib/valChangesTracker';
import { describe, expect, it } from 'vitest';

const baseDetail = {
	valDetailsId: 'a',
	valId: 1,
	groupId: 2,
	groupContent: 'Hello',
	bullet: false,
	indent: 1,
	bold: false,
	center: false,
	blankLineAfter: null,
	tightLineHeight: false,
	displayOrder: 1,
};

describe('calculateChanges', () => {
	it('detects created details', () => {
		const changes = calculateChanges(1, 2, [], [baseDetail]);
		expect(changes[0].action).toBe('create');
		expect(changes[0].detail?.groupContent).toBe('Hello');
	});

	it('detects deleted details', () => {
		const changes = calculateChanges(1, 2, [baseDetail], []);
		expect(changes[0].action).toBe('delete');
		expect(changes[0].detail?.valDetailsId).toBe('a');
	});

	it('detects updated details', () => {
		const updated = { ...baseDetail, groupContent: 'Changed', displayOrder: 1 };
		const changes = calculateChanges(1, 2, [baseDetail], [updated]);
		expect(changes[0].action).toBe('update');
		expect(changes[0].detail?.groupContent).toBe('Changed');
	});

	it('returns empty for unchanged details', () => {
		const changes = calculateChanges(1, 2, [baseDetail], [baseDetail]);
		expect(changes.length).toBe(0);
	});

	it('handles undefined arrays', () => {
		const changes = calculateChanges(1, 2, undefined as any, undefined as any);
		expect(Array.isArray(changes)).toBe(true);
	});
});

describe('aggregateAllChanges', () => {
	it('aggregates changes from multiple sections', () => {
		const state = {
			2: {
				groupID: 2,
				editorContent: '',
				details: [baseDetail],
				originalDetails: [],
			},
			3: {
				groupID: 3,
				editorContent: '',
				details: [],
				originalDetails: [baseDetail],
			},
		};
		const changes = aggregateAllChanges(1, state);
		expect(changes.some(c => c.action === 'create')).toBe(true);
		expect(changes.some(c => c.action === 'delete')).toBe(true);
	});

	it('skips sections with missing data', () => {
		const state = {
			2: {
				groupID: 2,
				editorContent: '',
				details: undefined as any,
				originalDetails: undefined as any,
			},
		};
		const changes = aggregateAllChanges(1, state);
		expect(changes.length).toBe(0);
	});
});
