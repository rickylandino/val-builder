import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MonthDayCalendar } from '@/components/ui/MonthDayCalendar';
import userEvent from '@testing-library/user-event';
import React from 'react';

describe('MonthDayCalendar', () => {
  it('renders calendar', () => {
    render(
      <MonthDayCalendar
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.getByTestId('month-day-calendar')).toBeInTheDocument();
  });

  it('calls onChange when day is clicked', async () => {
    const handleChange = vi.fn();
    render(
      <MonthDayCalendar value="01/01" onChange={handleChange} />
    );
    // Open popover by clicking the trigger
    const trigger = screen.getByTestId('month-day-calendar-trigger');
    await userEvent.click(trigger);
    // Click a day button
    const dayBtn = await screen.findByTestId('month-day-calendar-day-2');
    await userEvent.click(dayBtn);
    expect(handleChange).toHaveBeenCalled();
  });

  it('changes month when select is used', async () => {
    const handleChange = vi.fn();
    render(
      <MonthDayCalendar value="01/01" onChange={handleChange} />
    );
    // Open popover by clicking the trigger
    const trigger = screen.getByTestId('month-day-calendar-trigger');
    await userEvent.click(trigger);
    // Change month select
    const select = await screen.findByTestId('month-day-calendar-month-select');
    await userEvent.selectOptions(select, '1'); // February
    expect((select as HTMLSelectElement).value).toBe('1');
  });

  it('calls handleDayClick when day button is clicked', async () => {
    const handleChange = vi.fn();
    render(
      <MonthDayCalendar value="02/01" onChange={handleChange} />
    );
    // Open popover by clicking the trigger
    const trigger = screen.getByTestId('month-day-calendar-trigger');
    await userEvent.click(trigger);
    // Click a day button
    const dayBtn = await screen.findByTestId('month-day-calendar-day-3');
    await userEvent.click(dayBtn);
    expect(handleChange).toHaveBeenCalled();
  });

  // Controlled wrapper for input change coverage
function ControlledMonthDayCalendar() {
  const [value, setValue] = React.useState('');
  return <MonthDayCalendar value={value} onChange={setValue} />;
}
  it('input change logic covers MM/dd format and value updates', async () => {
    render(<ControlledMonthDayCalendar />);
    const input = screen.getByTestId('month-day-input');
    // Type month
    await userEvent.type(input, '01');
    expect(input).toHaveValue('01/'); // Should auto-insert slash
    // Type day
    await userEvent.type(input, '02');
    expect(input).toHaveValue('01/02'); // Should limit to MM/dd
    // Type extra characters
    await userEvent.type(input, '99');
    expect(input).toHaveValue('01/02'); // Should not exceed 5 chars
    // Type invalid chars
    await userEvent.type(input, 'abc');
    expect(input).toHaveValue('01/02'); // Should ignore non-digits
  });
});