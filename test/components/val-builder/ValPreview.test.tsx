import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValPreview } from '@/components/val-builder/ValPreview';
import type { ValDetail, ValSection } from '@/types/api';

const partialValSection: Partial<ValSection> = {
    defaultColWidth1: 1,
    defaultColWidth2: 2,
    defaultColWidth3: 3,
    defaultColWidth4: 4,
    defaultColType1: 'test',
    defaultColType2: 'test',
    defaultColType3: 'test',
    defaultColType4: 'test',
    autoIndent: true
}

const mockSections: ValSection[] = [
	{ groupId: 1, sectionText: 'Section One', displayOrder: 1, ...partialValSection } as ValSection,
	{ groupId: 2, sectionText: 'Section Two', displayOrder: 2, ...partialValSection } as ValSection
];
const mockDetails: Map<number, ValDetail[]> = new Map([
	[1, [{
		valDetailsId: "101",
		groupContent: 'Detail 1',
		bold: false,
		center: false,
		bullet: false,
		indent: 0,
		valId: 1,
		groupId: 1,
		displayOrder: 1,
		blankLineAfter: 0,
		tightLineHeight: false
	}]],
	[2, [{
		valDetailsId: "102",
		groupContent: 'Detail 2',
		bold: true,
		center: true,
		bullet: true,
		indent: 2,
		valId: 1,
		groupId: 2,
		displayOrder: 2,
		blankLineAfter: 0,
		tightLineHeight: false
	}]],
]);

describe('ValPreview', () => {
	it('renders main header, plan year, and watermark', () => {
		render(
			<ValPreview
				valSections={mockSections}
				allDetails={mockDetails}
				showSectionHeaders={true}
				valDescription="Test VAL"
				planYearStart="2025"
			/>
		);
		expect(screen.getByText('Test VAL')).toBeInTheDocument();
		expect(screen.getByText('2025 Valuation')).toBeInTheDocument();
		expect(screen.getByText('VAL DRAFT')).toBeInTheDocument();
	});

	it('renders section headers when showSectionHeaders is true and details exist', () => {
		render(
			<ValPreview
				valSections={mockSections}
				allDetails={mockDetails}
				showSectionHeaders={true}
				valDescription="Test VAL"
				planYearStart="2025"
			/>
		);
		expect(screen.getByText('Section One')).toBeInTheDocument();
		expect(screen.getByText('Section Two')).toBeInTheDocument();
	});

	it('renders details using ValDetailRenderer', () => {
		render(
			<ValPreview
				valSections={mockSections}
				allDetails={mockDetails}
				showSectionHeaders={true}
				valDescription="Test VAL"
				planYearStart="2025"
			/>
		);
		expect(screen.getByText('Detail 1')).toBeInTheDocument();
		expect(screen.getByText('Detail 2')).toBeInTheDocument();
	});

	it('renders signature and enclosures sections', () => {
		render(
			<ValPreview
				valSections={mockSections}
				allDetails={mockDetails}
				showSectionHeaders={true}
				valDescription="Test VAL"
				planYearStart="2025"
			/>
		);
		expect(screen.getByText('Sincerely,')).toBeInTheDocument();
		expect(screen.getByText('[Ron Im Coude, CPC, QPA, QPAJI]')).toBeInTheDocument();
		expect(screen.getByText('Enclosures')).toBeInTheDocument();
	});

	it('handles empty sections and details gracefully', () => {
		render(
			<ValPreview
				valSections={[]}
				allDetails={new Map()}
				showSectionHeaders={true}
				valDescription="Test VAL"
				planYearStart="2025"
			/>
		);
		expect(screen.getByText('Test VAL')).toBeInTheDocument();
		expect(screen.getByText('2025 Valuation')).toBeInTheDocument();
		expect(screen.getByText('VAL DRAFT')).toBeInTheDocument();
		expect(screen.getByText('Sincerely,')).toBeInTheDocument();
		expect(screen.getByText('Enclosures')).toBeInTheDocument();
	});
});
