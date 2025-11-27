import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionNavigation } from '@/components/sections/SectionNavigation';

describe('SectionNavigation', () => {
	const sections = ['Section 1', 'Section 2', 'Section 3'];
	const currentSection = 'Section 2';
	let onSectionChange: (section: string) => void;
	let onPrevSection: () => void;
	let onNextSection: () => void;

	beforeEach(() => {
		onSectionChange = vi.fn();
		onPrevSection = vi.fn();
		onNextSection = vi.fn();
	});

	it('renders all sections and current section', () => {
		render(
			<SectionNavigation
				sections={sections}
				currentSection={currentSection}
				onSectionChange={onSectionChange}
				onPrevSection={onPrevSection}
				onNextSection={onNextSection}
			/>
		);
		expect(screen.getByText('Sections')).toBeInTheDocument();
		// Only the current section value is visible before opening the dropdown
		expect(screen.getByText(currentSection)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Prev Section/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Next Section/i })).toBeInTheDocument();
	});

	it('calls onSectionChange when a new section is selected', async () => {
		render(
			<SectionNavigation
				sections={sections}
				currentSection={currentSection}
				onSectionChange={onSectionChange}
				onPrevSection={onPrevSection}
				onNextSection={onNextSection}
			/>
		);
		const user = userEvent.setup();
		// Open select dropdown (Radix Select uses combobox role)
		await user.click(screen.getByRole('combobox'));
		// Now the options are rendered, select 'Section 3'
		await user.click(screen.getByText('Section 3'));
		expect(onSectionChange).toHaveBeenCalledWith('Section 3');
	});

	it('calls onPrevSection when Prev Section button is clicked', async () => {
		render(
			<SectionNavigation
				sections={sections}
				currentSection={currentSection}
				onSectionChange={onSectionChange}
				onPrevSection={onPrevSection}
				onNextSection={onNextSection}
			/>
		);
		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: /Prev Section/i }));
		expect(onPrevSection).toHaveBeenCalledTimes(1);
	});

	it('calls onNextSection when Next Section button is clicked', async () => {
		render(
			<SectionNavigation
				sections={sections}
				currentSection={currentSection}
				onSectionChange={onSectionChange}
				onPrevSection={onPrevSection}
				onNextSection={onNextSection}
			/>
		);
		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: /Next Section/i }));
		expect(onNextSection).toHaveBeenCalledTimes(1);
	});
});
