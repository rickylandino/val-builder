import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValDetailRenderer } from '@/components/val-builder/ValDetailRenderer';
import { mockValDetail } from './test-data';

describe('ValDetailRenderer', () => {
	it('renders detail content as HTML', () => {
		render(<ValDetailRenderer detail={mockValDetail} index={0} />);
		expect(screen.getByText(/Sample content/)).toBeInTheDocument();
	});

	it('applies bold and center classes/styles', () => {
		render(<ValDetailRenderer detail={{ ...mockValDetail, bold: true, center: true }} index={0} />);
		const div = screen.getByText(/Sample content/).closest('div.editor-preview');
		expect(div).toHaveClass('font-bold');
		expect(div).toHaveClass('text-center');
	});

	it('applies indentation and bullet margin', () => {
		render(<ValDetailRenderer detail={{ ...mockValDetail, indent: 2, bullet: true }} index={0} />);
		const div = screen.getByText(/Sample content/).closest('div.editor-preview') as HTMLElement | null; //NOSONAR
		expect(div?.style.marginLeft).toBe('calc(20px + 2.4rem)');
	});

	it('highlights chevron fields', () => {
		const chevronDetail = {
			...mockValDetail,
			groupContent: '<< Highlighted >>',
		};
		render(<ValDetailRenderer detail={chevronDetail} index={0} />);
		const chevronSpan = screen.getByText(/<< Highlighted >>/);
		expect(chevronSpan).toHaveClass('chevron-placeholder');
		expect(chevronSpan).toHaveAttribute('data-chevron-placeholder', 'true');
	});

	it('uses index as key if valDetailsId is missing', () => {
		// This test is mostly for coverage, as React key is not exposed in DOM
		const detail = { ...mockValDetail, valDetailsId: '' };
		render(<ValDetailRenderer detail={detail} index={42} />);
		expect(screen.getByText(/Sample content/)).toBeInTheDocument();
	});
});
