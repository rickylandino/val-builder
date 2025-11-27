import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValBuilderDrawer } from '@/components/val-builder/ValBuilderDrawer';
import { valHeader } from './test-data';

// Mock ValBuilder to avoid deep rendering
vi.mock('@/components/val-builder/ValBuilder', () => ({
	ValBuilder: ({ valHeader }: any) => (
		<div data-testid="val-builder">ValBuilder: {valHeader ? valHeader.valDescription : 'none'}</div>
	),
}));

describe('ValBuilderDrawer', () => {


	it('renders drawer and ValBuilder when open and valHeader is provided', () => {
		render(
			<ValBuilderDrawer open={true} onClose={vi.fn()} valHeader={valHeader} />
		);
		expect(screen.getByTestId('val-builder')).toHaveTextContent('ValBuilder: Test VAL');
	});

	it('renders "No VAL selected" when open and valHeader is null', () => {
		render(
			<ValBuilderDrawer open={true} onClose={vi.fn()} valHeader={null} />
		);
		expect(screen.getByText('No VAL selected')).toBeInTheDocument();
	});

	it('does not render drawer when open is false', () => {
		render(
			<ValBuilderDrawer open={false} onClose={vi.fn()} valHeader={valHeader} />
		);
		expect(screen.queryByTestId('val-builder')).not.toBeInTheDocument();
		expect(screen.queryByText('No VAL selected')).not.toBeInTheDocument();
	});
});
