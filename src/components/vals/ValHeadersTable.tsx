import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { ValHeader } from '@/types/api';
import { useState } from 'react';
import { ValBuilderDrawer } from '@/components/val-builder/ValBuilderDrawer';
import { useValBuilder } from '@/contexts/ValBuilderContext';
import { formatAsAmericanDate } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';


export const ValHeadersTable = ({ valHeaders }: { valHeaders: ValHeader[] }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedValHeader, setSelectedValHeader] = useState<ValHeader | null>(null);
    const { resetContext } = useValBuilder();
    const queryClient = useQueryClient();

    const handleOpen = (valHeader: ValHeader) => {
        setSelectedValHeader(valHeader);
        setDrawerOpen(true);
    };

    const handleClose = () => {
        queryClient.invalidateQueries();
        resetContext();
        setDrawerOpen(false);
        setSelectedValHeader(null);
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead>Description</TableHead>
                        <TableHead>Plan Year</TableHead>
                        <TableHead>VAL Date</TableHead>
                        <TableHead>Finalized Date</TableHead>
                        <TableHead>Finalized By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {valHeaders.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                No valuation letters found
                            </TableCell>
                        </TableRow>
                    ) : (
                        valHeaders.map((valHeader) => (
                            <TableRow key={valHeader.valId}>
                                <TableCell className="font-medium">
                                    {valHeader.valDescription || '-'}
                                </TableCell>
                                <TableCell>
                                    {valHeader.planYearBeginDate && valHeader.planYearEndDate
                                        ? `${formatAsAmericanDate(valHeader.planYearBeginDate)} - ${formatAsAmericanDate(valHeader.planYearEndDate)}`
                                        : '-'}
                                </TableCell>
                                <TableCell>{formatAsAmericanDate(valHeader.valDate)}</TableCell>
                                <TableCell>{formatAsAmericanDate(valHeader.finalizeDate)}</TableCell>
                                <TableCell>{valHeader.finalizedBy || '-'}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                                        onClick={() => handleOpen(valHeader)}
                                    >
                                        Open
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            <ValBuilderDrawer open={drawerOpen} onClose={handleClose} valHeader={selectedValHeader} />
        </div>
    );
};
