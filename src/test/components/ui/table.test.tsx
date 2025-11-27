import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption } from '../../../components/ui/table';

describe('Table', () => {
  it('renders table', () => {
    render(<Table><tbody><tr><td>Cell</td></tr></tbody></Table>);
    expect(screen.getByText('Cell')).toBeInTheDocument();
  });

  it('renders TableHeader with custom class and props', () => {
    render(<table><TableHeader className="header-class" data-testid="header" /></table>);
    const header = screen.getByTestId('header');
    expect(header).toHaveClass('header-class');
  });

  it('renders TableBody with custom class and props', () => {
    render(<table><TableBody className="body-class" data-testid="body" /></table>);
    const body = screen.getByTestId('body');
    expect(body).toHaveClass('body-class');
  });

  it('renders TableFooter with custom class and props', () => {
    render(<table><TableFooter className="footer-class" data-testid="footer" /></table>);
    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('footer-class');
  });

  it('renders TableRow with custom class and props', () => {
    render(<table><tbody><TableRow className="row-class" data-testid="row" /></tbody></table>);
    const row = screen.getByTestId('row');
    expect(row).toHaveClass('row-class');
  });

  it('renders TableHead with custom class and props', () => {
    render(<table><thead><tr><TableHead className="head-class" data-testid="head">Head</TableHead></tr></thead></table>);
    const head = screen.getByTestId('head');
    expect(head).toHaveClass('head-class');
    expect(head).toHaveTextContent('Head');
  });

  it('renders TableCell with custom class and props', () => {
    render(<table><tbody><tr><TableCell className="cell-class" data-testid="cell">Cell</TableCell></tr></tbody></table>);
    const cell = screen.getByTestId('cell');
    expect(cell).toHaveClass('cell-class');
    expect(cell).toHaveTextContent('Cell');
  });

  it('renders TableCaption with custom class and props', () => {
    render(<table><TableCaption className="caption-class" data-testid="caption">Caption</TableCaption></table>);
    const caption = screen.getByTestId('caption');
    expect(caption).toHaveClass('caption-class');
    expect(caption).toHaveTextContent('Caption');
  });
});