import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormatOptionsDialog } from '../../../components/val-builder/FormatOptionsDialog';
import { mockValDetail } from './test-data';

describe('FormatOptionsDialog', () => {
    it('updates tight line height and calls onSave with correct value', async () => {
        const onSave = vi.fn();
        render(
            <FormatOptionsDialog open={true} onOpenChange={vi.fn()} valDetail={mockValDetail} onSave={onSave} />
        );
        await userEvent.click(screen.getByLabelText('Tight Line Height'));
        expect(screen.getByLabelText('Tight Line Height')).toBeChecked();
        await userEvent.click(screen.getByRole('button', { name: 'OK' }));
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ tightLineHeight: true }));
    });

    it('selects Indentation 4 and Blank Line After 3, then calls onSave', async () => {
        const onSave = vi.fn();
        render(
            <FormatOptionsDialog open={true} onOpenChange={vi.fn()} valDetail={mockValDetail} onSave={onSave} />
        );
        // Indentation select: open and select '4'
        await userEvent.click(screen.getByLabelText('Indentation'));
        await userEvent.click(screen.getByText('4'));
        expect(screen.getByLabelText('Indentation')).toHaveTextContent('4');
        // Blank Line After select: open and select '3'
        await userEvent.click(screen.getByLabelText('Blank Line After'));
        await userEvent.click(screen.getByText('3'));
        expect(screen.getByLabelText('Blank Line After')).toHaveTextContent('3');
        await userEvent.click(screen.getByRole('button', { name: 'OK' }));
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ indent: 4, blankLineAfter: 3 }));
    });

    it('calls onOpenChange(false) when Cancel is clicked after changes', async () => {
        const onOpenChange = vi.fn();
        render(
            <FormatOptionsDialog open={true} onOpenChange={onOpenChange} valDetail={mockValDetail} onSave={vi.fn()} />
        );
        await userEvent.click(screen.getByLabelText('Bold'));
        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('renders with valDetail as null and shows default state', () => {
        render(
            <FormatOptionsDialog open={true} onOpenChange={vi.fn()} valDetail={null} onSave={vi.fn()} />
        );
        expect(screen.getByLabelText('Bold')).not.toBeChecked();
        expect(screen.getByLabelText('Bullet')).not.toBeChecked();
        expect(screen.getByLabelText('Center')).not.toBeChecked();
        expect(screen.getByLabelText('Tight Line Height')).not.toBeChecked();
        expect(screen.getByLabelText('Indentation')).toHaveTextContent('0');
        expect(screen.getByLabelText('Blank Line After')).toHaveTextContent('0');
    });
    it('renders all format controls when open', () => {
        render(
            <FormatOptionsDialog open={true} onOpenChange={vi.fn()} valDetail={mockValDetail} onSave={vi.fn()} />
        );
        expect(screen.getByLabelText('Bold')).toBeInTheDocument();
        expect(screen.getByLabelText('Bullet')).toBeInTheDocument();
        expect(screen.getByLabelText('Center')).toBeInTheDocument();
        expect(screen.getByLabelText('Tight Line Height')).toBeInTheDocument();
        expect(screen.getByLabelText('Indentation')).toBeInTheDocument();
        expect(screen.getByLabelText('Blank Line After')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('initializes controls from valDetail', () => {
        render(
            <FormatOptionsDialog open={true} onOpenChange={vi.fn()} valDetail={mockValDetail} onSave={vi.fn()} />
        );
        expect(screen.getByLabelText('Bold')).toBeChecked();
        expect(screen.getByLabelText('Bullet')).not.toBeChecked();
        expect(screen.getByLabelText('Center')).toBeChecked();
        expect(screen.getByLabelText('Tight Line Height')).not.toBeChecked();
        expect(screen.getByLabelText('Indentation')).toHaveTextContent('2');
        expect(screen.getByLabelText('Blank Line After')).toHaveTextContent('1');
    });

    it('calls onSave and onOpenChange(false) when OK is clicked', async () => {
        const onSave = vi.fn();
        const onOpenChange = vi.fn();
        render(
            <FormatOptionsDialog open={true} onOpenChange={onOpenChange} valDetail={mockValDetail} onSave={onSave} />
        );
        await userEvent.click(screen.getByRole('button', { name: 'OK' }));
        expect(onSave).toHaveBeenCalledWith({
            bold: true,
            bullet: false,
            center: true,
            tightLineHeight: false,
            indent: 2,
            blankLineAfter: 1,
        });
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('calls onOpenChange(false) when Cancel is clicked', async () => {
        const onOpenChange = vi.fn();
        render(
            <FormatOptionsDialog open={true} onOpenChange={onOpenChange} valDetail={mockValDetail} onSave={vi.fn()} />
        );
        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('updates state when controls are changed', async () => {
        render(
            <FormatOptionsDialog open={true} onOpenChange={vi.fn()} valDetail={mockValDetail} onSave={vi.fn()} />
        );
        await userEvent.click(screen.getByLabelText('Bold'));
        expect(screen.getByLabelText('Bold')).not.toBeChecked();
        await userEvent.click(screen.getByLabelText('Bullet'));
        expect(screen.getByLabelText('Bullet')).toBeChecked();
        // Indentation select: open and select '4'
        await userEvent.click(screen.getByLabelText('Indentation'));
        await userEvent.click(screen.getByText('4'));
        expect(screen.getByLabelText('Indentation')).toHaveTextContent('4');
        // Blank Line After select: open and select '3'
        await userEvent.click(screen.getByLabelText('Blank Line After'));
        await userEvent.click(screen.getByText('3'));
        expect(screen.getByLabelText('Blank Line After')).toHaveTextContent('3');
    });
});
