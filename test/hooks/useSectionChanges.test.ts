import { renderHook, act } from '@testing-library/react';
import { useSectionChanges, generateHtmlContent } from '@/hooks/useSectionChanges';
import { describe, expect, it } from 'vitest';


const mockDetails = [
	{
		valDetailsId: '1',
		valId: 123,
		groupId: 10,
		groupContent: '<p>First</p>',
		bullet: false,
		indent: 1,
		bold: false,
		center: false,
		blankLineAfter: null,
		tightLineHeight: false,
		displayOrder: 1,
	},
	{
		valDetailsId: '2',
		valId: 123,
		groupId: 10,
		groupContent: '<p>Second</p>',
		bullet: true,
		indent: 2,
		bold: true,
		center: true,
		blankLineAfter: null,
		tightLineHeight: true,
		displayOrder: 2,
	},
];

describe('useSectionChanges', () => {
	it('initializes section state and editor content', () => {
		const { result } = renderHook(() => useSectionChanges({ valId: 123, currentGroupId: 10, allValDetails: mockDetails }));
		expect(result.current.currentDetails.length).toBe(2);
		expect(result.current.editorContent).toBe(generateHtmlContent(mockDetails));
	});
	it('handles empty allValDetails array', () => {
		const { result } = renderHook(() => useSectionChanges({ valId: 999, currentGroupId: 99, allValDetails: [] }));
		expect(result.current.currentDetails).toEqual([]);
		expect(result.current.editorContent).toBe('');
	});

	it('handles undefined allValDetails', () => {
		const { result } = renderHook(() => useSectionChanges({ valId: 999, currentGroupId: 99, allValDetails: undefined as any }));
		expect(result.current.currentDetails).toEqual([]);
		expect(result.current.editorContent).toBe('');
	});

	it('addDetail handles minimal input', () => {
		const { result } = renderHook(() => useSectionChanges({ valId: 123, currentGroupId: 10, allValDetails: [] }));
		act(() => {
			result.current.addDetail({ groupContent: 'Minimal' });
		});
		expect(result.current.currentDetails.length).toBe(1);
		expect(result.current.editorContent).toContain('Minimal');
	});

	it('removeDetail does nothing for invalid id', () => {
		const { result } = renderHook(() => useSectionChanges({ valId: 123, currentGroupId: 10, allValDetails: mockDetails }));
		act(() => {
			result.current.removeDetail('nonexistent');
		});
		expect(result.current.currentDetails.length).toBe(2);
	});

	it('updateDetail does nothing for invalid id', () => {
		const { result } = renderHook(() => useSectionChanges({ valId: 123, currentGroupId: 10, allValDetails: mockDetails }));
		act(() => {
			result.current.updateDetail('nonexistent', { bold: true });
		});
		expect(result.current.currentDetails[0].bold).toBe(false);
	});

	it('reorderDetails does nothing for out-of-bounds indices', () => {
		const { result } = renderHook(() => useSectionChanges({ valId: 123, currentGroupId: 10, allValDetails: mockDetails }));
		act(() => {
			result.current.reorderDetails(-1, 99);
		});
		expect(result.current.currentDetails[0].valDetailsId).toBe('1');
		expect(result.current.currentDetails[1].valDetailsId).toBe('2');
	});

	it('resetChanges does nothing if no changes', () => {
		const { result } = renderHook(() => useSectionChanges({ valId: 123, currentGroupId: 10, allValDetails: mockDetails }));
		act(() => {
			result.current.resetChanges();
		});
		expect(result.current.hasChanges()).toBe(false);
	});

	it('adds a detail', () => {
		const { result } = renderHook(() => useSectionChanges({ valId: 123, currentGroupId: 10, allValDetails: mockDetails }));
		act(() => {
			result.current.addDetail({ groupContent: '<p>Third</p>', indent: 0 });
		});
		expect(result.current.currentDetails.length).toBe(3);
		expect(result.current.editorContent).toContain('Third');
	});

	it('removes a detail', () => {
		const { result } = renderHook(() => useSectionChanges({ valId: 123, currentGroupId: 10, allValDetails: mockDetails }));
		act(() => {
			result.current.removeDetail('1');
		});
		expect(result.current.currentDetails.length).toBe(1);
		expect(result.current.editorContent).not.toContain('First');
	});

	it('updates a detail', () => {
		const { result } = renderHook(() => useSectionChanges({ valId: 123, currentGroupId: 10, allValDetails: mockDetails }));
		act(() => {
			result.current.updateDetail('1', { bold: true });
		});
		expect(result.current.currentDetails[0].bold).toBe(true);
	});

	it('reorders details', () => {
		const { result } = renderHook(() => useSectionChanges({ valId: 123, currentGroupId: 10, allValDetails: mockDetails }));
		act(() => {
			result.current.reorderDetails(0, 1);
		});
		expect(result.current.currentDetails[1].valDetailsId).toBe('1');
	});

	it('detects unsaved changes', () => {
		const { result } = renderHook(() => useSectionChanges({ valId: 123, currentGroupId: 10, allValDetails: mockDetails }));
		act(() => {
			result.current.updateDetail('1', { bold: true });
		});
		expect(result.current.hasChanges()).toBe(true);
	});

	it('resets changes', () => {
		const { result } = renderHook(() => useSectionChanges({ valId: 123, currentGroupId: 10, allValDetails: mockDetails }));
		act(() => {
			result.current.updateDetail('1', { bold: true });
			result.current.resetChanges();
		});
		expect(result.current.hasChanges()).toBe(false);
	});

    it('generateHtmlContent produces correct HTML', () => {
	const html = generateHtmlContent([{
		valDetailsId: 'abc',
		valId: 1,
		groupId: 2,
		groupContent: 'Hello',
		bullet: true,
		indent: 2,
		bold: true,
		center: true,
		blankLineAfter: null,
		tightLineHeight: true,
		displayOrder: 1,
	}]);
	expect(html).toContain('class="indent-level-2 text-center tightLineHeight font-bold bullet"');
	expect(html).toContain('data-val-details-id="abc"');
});
it('loads existing section details and editor content', () => {
	const details = [
		{ valDetailsId: '1', valId: 1, groupId: 2, groupContent: 'A', bullet: false, indent: 1, bold: false, center: false, blankLineAfter: null, tightLineHeight: false, displayOrder: 1 },
	];
	const { result, rerender } = renderHook(({ groupId }) => useSectionChanges({ valId: 1, currentGroupId: groupId, allValDetails: details }), { initialProps: { groupId: 2 } });
	act(() => {
		result.current.updateEditorContent('changed');
	});
	rerender({ groupId: 2 });
	expect(result.current.currentDetails[0].groupContent).toBe('A');
	expect(result.current.editorContent).toBe('changed');
});
it('updateEditorContent updates editor content and state', () => {
	const { result } = renderHook(() => useSectionChanges({ valId: 1, currentGroupId: 2, allValDetails: mockDetails }));
	act(() => {
		result.current.updateEditorContent('new content');
	});
	expect(result.current.editorContent).toBe('new content');
});
it('updateSingleValDetail updates the correct detail', () => {
	const { result } = renderHook(() => useSectionChanges({ valId: 123, currentGroupId: 10, allValDetails: mockDetails }));
	act(() => {
		result.current.updateSingleValDetail({ ...mockDetails[0], bold: true });
	});
	expect(result.current.currentDetails[0].bold).toBe(true);
});
it('getAllChanges parses and aggregates changes', () => {
	const { result } = renderHook(() => useSectionChanges({ valId: 1, currentGroupId: 2, allValDetails: [] }));
	act(() => {
		result.current.updateEditorContent('<p class="font-bold" data-val-details-id="abc">Changed</p>');
	});
	const changes = result.current.getAllChanges();
	expect(Array.isArray(changes)).toBe(true);
});
it('hasChanges returns true when there are unsaved changes', () => {
	const { result } = renderHook(() => useSectionChanges({ valId: 1, currentGroupId: 2, allValDetails: [] }));
	act(() => {
		result.current.updateEditorContent('<p class="font-bold" data-val-details-id="abc">Changed</p>');
	});
	expect(result.current.hasChanges()).toBe(true);
});
});
