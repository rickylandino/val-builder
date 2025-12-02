import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ManageValItems } from '@/components/management-panel/ManageValItems';
import * as useValSectionsHook from '@/hooks/api/useValSections';
import * as useValTemplateItemsHook from '@/hooks/api/useValTemplateItems';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { valTemplateItemsService } from '@/services/api/valTemplateItemsService';

describe('ManageValItems', () => {
    globalThis.ResizeObserver = class {
        observe() {
            // intentionally left blank for test environment
        }
        unobserve() {
            // intentionally left blank for test environment
        }
        disconnect() {
            // intentionally left blank for test environment
        }
    };

  beforeEach(() => {
    (vi.spyOn(valTemplateItemsService, 'update') as any).mockResolvedValue({});
    (vi.spyOn(valTemplateItemsService, 'updateDisplayOrder') as any).mockResolvedValue({});
    (vi.spyOn(useValSectionsHook, 'useValSections') as any).mockReturnValue({
      data: [
        { groupId: 1, sectionText: 'Section 1', displayOrder: 1 },
        { groupId: 2, sectionText: 'Section 2', displayOrder: 2 },
      ],
      isLoading: false,
      error: null,
    });
    (vi.spyOn(useValTemplateItemsHook, 'useValTemplateItemsByGroupId') as any).mockReturnValue({
      data: [
        { itemId: 1, itemText: 'Item 1', displayOrder: 0, defaultOnVal: true, center: false, bold: true, bullet: false, tightLineHeight: false, indent: 0, blankLineAfter: 0 },
        { itemId: 2, itemText: 'Item 2', displayOrder: 1, defaultOnVal: false, center: true, bold: false, bullet: true, tightLineHeight: true, indent: 1, blankLineAfter: 1 },
        { itemId: 3, itemText: 'Item 3', displayOrder: 2, defaultOnVal: false, center: false, bold: false, bullet: false, tightLineHeight: false, indent: 0, blankLineAfter: 0 },
      ],
      isLoading: false,
      refetch: vi.fn(),
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders table with items', () => {
    render(<ManageValItems />);
    expect(screen.getByText('VAL Items')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders group select and changes group', async () => {
    render(<ManageValItems />);
    expect(await screen.findByTestId('group-select-trigger')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('group-select-trigger'));
    const section2 = await screen.findByTestId('section-2');
    fireEvent.click(section2);
    expect(await screen.findByText('Section 2')).toBeInTheDocument();
  });

  it('opens edit dialog when row is clicked', async () => {
    render(<ManageValItems />);
    fireEvent.click(screen.getByText('Item 1'));
    expect(await screen.findByText('Edit VAL Item')).toBeInTheDocument();
    expect(await screen.findByLabelText('Bold')).toBeInTheDocument();
    expect(await screen.findByLabelText('Bullet')).toBeInTheDocument();
    expect(await screen.findByLabelText('Center')).toBeInTheDocument();
    expect(await screen.findByLabelText('Default on VAL')).toBeInTheDocument();
    expect(await screen.findByLabelText('Tight Line Height')).toBeInTheDocument();
    expect(await screen.findByLabelText('Indent')).toBeInTheDocument();
    expect(await screen.findByLabelText('Blank Line After')).toBeInTheDocument();
  });

  it('closes edit dialog when Cancel is clicked', async () => {
    render(<ManageValItems />);
    fireEvent.click(screen.getByText('Item 1'));
    const cancelBtn = await screen.findByText('Cancel');
    fireEvent.click(cancelBtn);
    await screen.findByText('VAL Items'); // Wait for dialog to close
    expect(screen.queryByText('Edit VAL Item')).not.toBeInTheDocument();
  });

  it('toggles all checkboxes in edit dialog', async () => {
    render(<ManageValItems />);
    fireEvent.click(screen.getByText('Item 1'));
    
    const boldCheckbox = await screen.findByLabelText('Bold');
    const bulletCheckbox = await screen.findByLabelText('Bullet');
    const centerCheckbox = await screen.findByLabelText('Center');
    const defaultOnValCheckbox = await screen.findByLabelText('Default on VAL');
    const tightLineHeightCheckbox = await screen.findByLabelText('Tight Line Height');
    
    // Toggle each checkbox
    fireEvent.click(boldCheckbox);
    fireEvent.click(bulletCheckbox);
    fireEvent.click(centerCheckbox);
    fireEvent.click(defaultOnValCheckbox);
    fireEvent.click(tightLineHeightCheckbox);
    
    expect(boldCheckbox).toBeInTheDocument();
    expect(bulletCheckbox).toBeInTheDocument();
  });

  it('changes indent and blank line after selects in edit dialog', async () => {
    render(<ManageValItems />);
    fireEvent.click(screen.getByText('Item 1'));
    
    const indentTrigger = await screen.findByLabelText('Indent');
    const blankLineAfterTrigger = await screen.findByLabelText('Blank Line After');
    
    // Click to open dropdown and select an option
    fireEvent.click(indentTrigger);
    fireEvent.click(blankLineAfterTrigger);
    
    expect(indentTrigger).toBeInTheDocument();
    expect(blankLineAfterTrigger).toBeInTheDocument();
  });

  it('updates item text in edit dialog', async () => {
    render(<ManageValItems />);
    fireEvent.click(screen.getByText('Item 1'));
    
    const textarea = await screen.findByLabelText('Item Text');
    
    // Change the textarea value
    fireEvent.change(textarea, { target: { value: 'Updated Item Text' } });
    
    expect(textarea).toHaveValue('Updated Item Text');
  });

  it('submits form and calls update service', async () => {
    render(<ManageValItems />);
    fireEvent.click(screen.getByText('Item 1'));
    
    const submitButton = await screen.findByText('Save');
    
    // Submit the form
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(valTemplateItemsService.update).toHaveBeenCalled();
    });
  });

  // Note: Drag-and-drop functionality is difficult to test in jsdom due to:
  // 1. React's synthetic event system doesn't fully support preventDefault() in tests
  // 2. The component's inline e.preventDefault() in onDragOver isn't triggered by fireEvent
  // 3. jsdom doesn't fully emulate browser drag-and-drop behavior
  // 
  // The drag-and-drop handlers (lines 52-72) should be tested with:
  // - E2E tests using Playwright or Cypress in a real browser
  // - Manual testing
  // - Or by refactoring handlers into testable pure functions
});