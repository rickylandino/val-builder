import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Dialog', () => {
    it('renders DialogHeader with custom class and props', () => {
        render(<DialogHeader className="header-class" data-testid="header">Header Content</DialogHeader>);
        const header = screen.getByTestId('header');
        expect(header).toHaveClass('header-class');
        expect(header).toHaveTextContent('Header Content');
    });

    it('renders DialogFooter with custom class and props', () => {
        render(<DialogFooter className="footer-class" data-testid="footer">Footer Content</DialogFooter>);
        const footer = screen.getByTestId('footer');
        expect(footer).toHaveClass('footer-class');
        expect(footer).toHaveTextContent('Footer Content');
    });

    it('renders DialogTitle with custom class and props', () => {
        render(
            <Dialog open={true}>
                <DialogContent>
                    <DialogTitle className="title-class" data-testid="title">Dialog Title</DialogTitle>
                </DialogContent>
            </Dialog>
        );
        const title = screen.getByTestId('title');
        expect(title).toHaveClass('title-class');
        expect(title).toHaveTextContent('Dialog Title');
    });

    it('renders DialogDescription with custom class and props', () => {
        render(
            <Dialog open={true}>
                <DialogContent>
                    <DialogDescription className="desc-class" data-testid="desc">Dialog Description</DialogDescription>
                </DialogContent>
            </Dialog>
        );
        const desc = screen.getByTestId('desc');
        expect(desc).toHaveClass('desc-class');
        expect(desc).toHaveTextContent('Dialog Description');
    });

    it('renders dialog content when open', () => {
        render(
            <Dialog open={true} onOpenChange={vi.fn()}>
                <DialogTrigger>
                    <button>Dialog Button</button>
                </DialogTrigger>
                <DialogContent>
                    <div>Dialog Content</div>
                </DialogContent>
            </Dialog>
        );
        expect(screen.getByText('Dialog Content')).toBeInTheDocument();
    });

    it('does not render dialog content when closed', () => {
        render(
            <Dialog open={false} onOpenChange={vi.fn()}>
                <DialogTrigger>
                    <button>Dialog Button</button>
                </DialogTrigger>
                <DialogContent>
                    <div>Dialog Content</div>
                </DialogContent>
            </Dialog>
        );
        expect(screen.queryByText('Dialog Content')).not.toBeInTheDocument();
    });

    it('calls onOpenChange when trigger is clicked', async () => {
        const handleOpenChange = vi.fn();
        render(
            <Dialog open={false} onOpenChange={handleOpenChange}>
                <DialogTrigger>
                    <button>Dialog Button</button>
                </DialogTrigger>
                <DialogContent>
                    <div>Dialog Content</div>
                </DialogContent>
            </Dialog>
        );
        await userEvent.click(screen.getByText('Dialog Button'));
        expect(handleOpenChange).toHaveBeenCalled();
    });
});