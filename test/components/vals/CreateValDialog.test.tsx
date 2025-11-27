


import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateValDialog } from '@/components/vals/CreateValDialog';
import { describe, expect, it, vi } from 'vitest';

// Mock useCreateValHeader
vi.mock('@/hooks/api/useValHeaders', () => ({
	useCreateValHeader: () => ({
		mutateAsync: vi.fn().mockResolvedValue({}),
	}),
}));

async function selectMonthDay(label: string, monthIdx: number, day: number) {
  const calendarTrigger = screen.getAllByTestId('month-day-calendar-trigger')[label === 'Plan Year Begin Date (MM/dd)' ? 0 : 1];
  await userEvent.click(calendarTrigger);
  const monthSelect = await screen.findByTestId('month-day-calendar-month-select');
  fireEvent.change(monthSelect, { target: { value: String(monthIdx) } });
  const dayBtn = await screen.findByTestId(`month-day-calendar-day-${day}`);
  await userEvent.click(dayBtn);
}

function openDialog() {
	userEvent.click(screen.getByText('New VAL'));
}

describe('CreateValDialog', () => {
    it('updates all input fields', async () => {
        render(<CreateValDialog planId={1} />);
        openDialog();
        await screen.findByLabelText('Description');
        const descInput = screen.getByLabelText('Description');
        fireEvent.change(descInput, { target: { value: 'VAL Desc' } });
        expect(descInput).toHaveValue('VAL Desc');

        await selectMonthDay('Plan Year Begin Date (MM/dd)', 2, 10); // March 10
        const beginInput = screen.getAllByTestId('month-day-input')[0];
        expect(beginInput).toHaveValue('03/10');

        await selectMonthDay('Plan Year End Date (MM/dd)', 3, 20); // April 20
        const endInput = screen.getAllByTestId('month-day-input')[1];
        expect(endInput).toHaveValue('04/20');

        await userEvent.selectOptions(screen.getByLabelText('VAL Year'), [`${new Date().getFullYear()}`]);
        expect(screen.getByLabelText('VAL Year')).toHaveValue(String(new Date().getFullYear()));

        await userEvent.selectOptions(screen.getByLabelText('VAL Quarter'), ['4']);
        expect(screen.getByLabelText('VAL Quarter')).toHaveValue('4');
    });

	it('submits with all fields changed and resets state', async () => {
		const onCreated = vi.fn();
		render(<CreateValDialog planId={1} onCreated={onCreated} />);
		openDialog();
		await screen.findByLabelText('Description');
		fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'VAL Desc' } });
		await selectMonthDay('Plan Year Begin Date (MM/dd)', 2, 10); // March 10
		await selectMonthDay('Plan Year End Date (MM/dd)', 3, 20); // April 20
		userEvent.selectOptions(screen.getByLabelText('VAL Year'), [`${new Date().getFullYear()}`]);
		userEvent.selectOptions(screen.getByLabelText('VAL Quarter'), ['4']);
		userEvent.click(screen.getByRole('button', { name: 'Create' }));
		await waitFor(() => {
			expect(onCreated).toHaveBeenCalled();
		});
		// Dialog should close and fields reset
		expect(screen.queryByLabelText('Description')).not.toBeInTheDocument();
	});
});
