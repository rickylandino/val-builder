import type { ValDetail, ValHeader } from "@/types/api";

export const mockValDetail: ValDetail = {
	bold: true,
	bullet: false,
	center: true,
	tightLineHeight: false,
	indent: 2,
	blankLineAfter: 1,
    valDetailsId: 'guid',
    groupContent: 'Sample content',
    valId: 1,
    groupId: 1,
    displayOrder: 1
};

export const valHeader: ValHeader = {
		valId: 1,
		valDescription: 'Test VAL',
		planYearBeginDate: '2025-01-01',
		planYearEndDate: '2025-12-31',
		planId: 2,
		valDate: '2025-01-15',
		finalizeDate: '2025-01-20',
		finalizedBy: 'Jane Smith',
		wordDocPath: '/docs/test.docx',
		valstatusId: 2,
		recipientName: 'John Doe',
		recipientAddress1: '123 Main St',
		recipientAddress2: 'Apt 4B',
		recipientCity: 'Sample City',
		recipientState: 'CA',
		recipientZip: '90001',
        marginLeftRight: 1,
        marginTopBottom: 1,
        fontSize: 12,
        valYear: 2025,
        valQuarter: 1
	};