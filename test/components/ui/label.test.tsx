import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/label';

describe('Label', () => {
  it('renders label with text', () => {
    render(<Label htmlFor='label'>Label Text</Label>);
    expect(screen.getByText('Label Text')).toBeInTheDocument();
  });
});