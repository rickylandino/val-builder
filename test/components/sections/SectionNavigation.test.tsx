import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionNavigation } from '@/components/sections/SectionNavigation';
import { ValBuilderProvider } from '@/contexts/ValBuilderContext';

const sections = [
  { groupId: 1, sectionText: 'Section 1' },
  { groupId: 2, sectionText: 'Section 2' },
  { groupId: 3, sectionText: 'Section 3' },
];

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <ValBuilderProvider initialCurrentGroupId={2}>
      {ui}
    </ValBuilderProvider>
  );
}

describe('SectionNavigation', () => {
  it('renders all sections and current section', () => {
    renderWithProvider(<SectionNavigation sections={sections} />);
    expect(screen.getByText('Sections')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Prev Section/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next Section/i })).toBeInTheDocument();
  });

  it('changes section when a new section is selected', async () => {
    renderWithProvider(<SectionNavigation sections={sections} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Section 3'));
    // Section 3 should now be selected
    expect(screen.getByText('Section 3')).toBeInTheDocument();
  });

  it('navigates to previous section when Prev Section button is clicked', async () => {
    renderWithProvider(<SectionNavigation sections={sections} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Prev Section/i }));
    // Section 1 should now be selected
    expect(screen.getByText('Section 1')).toBeInTheDocument();
  });

  it('navigates to next section when Next Section button is clicked', async () => {
    renderWithProvider(<SectionNavigation sections={sections} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Next Section/i }));
    // Section 3 should now be selected
    expect(screen.getByText('Section 3')).toBeInTheDocument();
  });
});