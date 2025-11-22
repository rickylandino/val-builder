import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionNavigation } from '@/components/sections/SectionNavigation';

describe('SectionNavigation', () => {
  const sections = ['Section 1', 'Section 2', 'Section 3'];
  const defaultProps = {
    sections,
    currentSection: 'Section 1',
    onSectionChange: vi.fn(),
    onPrevSection: vi.fn(),
    onNextSection: vi.fn(),
  };

  it('renders all sections in dropdown', () => {
    render(<SectionNavigation {...defaultProps} />);
    
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
    expect(screen.getByText('Section 3')).toBeInTheDocument();
  });

  it('displays current section as selected', () => {
    render(<SectionNavigation {...defaultProps} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('Section 1');
  });

  it('calls onSectionChange when section is selected', async () => {
    const user = userEvent.setup();
    const onSectionChange = vi.fn();
    render(<SectionNavigation {...defaultProps} onSectionChange={onSectionChange} />);
    
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'Section 2');
    
    expect(onSectionChange).toHaveBeenCalledWith('Section 2');
  });

  it('calls onPrevSection when prev button is clicked', async () => {
    const user = userEvent.setup();
    const onPrevSection = vi.fn();
    render(<SectionNavigation {...defaultProps} onPrevSection={onPrevSection} />);
    
    const prevButton = screen.getByRole('button', { name: '<< Prev Section' });
    await user.click(prevButton);
    
    expect(onPrevSection).toHaveBeenCalledTimes(1);
  });

  it('calls onNextSection when next button is clicked', async () => {
    const user = userEvent.setup();
    const onNextSection = vi.fn();
    render(<SectionNavigation {...defaultProps} onNextSection={onNextSection} />);
    
    const nextButton = screen.getByRole('button', { name: 'Next Section >>' });
    await user.click(nextButton);
    
    expect(onNextSection).toHaveBeenCalledTimes(1);
  });

  it('renders Sections label', () => {
    render(<SectionNavigation {...defaultProps} />);
    expect(screen.getByText('Sections')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<SectionNavigation {...defaultProps} />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('bg-white');
    expect(wrapper).toHaveClass('rounded-lg');
  });
});
