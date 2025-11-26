import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ValHeader } from '@/types/api';
import { useState } from 'react';
import { ValBuilderDrawer } from '@/components/val-builder/ValBuilderDrawer';

const getStatusLabel = (statusId: number | null) => {
    //TODO populate with database status'
  switch (statusId) {
    case 1:
      return 'Draft';
    case 2:
      return 'In Progress';
    case 3:
      return 'Finalized';
    case 4:
      return 'Archived';
    default:
      return 'Unknown';
  }
};

const getStatusBadge = (statusId: number | null) => {
  switch (statusId) {
    case 1:
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 2:
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 3:
      return 'bg-green-100 text-green-700 border-green-300';
    case 4:
      return 'bg-gray-50 text-gray-500 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};


export const ValHeadersTable = ({ valHeaders }: { valHeaders: ValHeader[] }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedValHeader, setSelectedValHeader] = useState<ValHeader | null>(null);

  const handleOpen = (valHeader: ValHeader) => {
    setSelectedValHeader(valHeader);
    setDrawerOpen(true);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Plan Year</TableHead>
            <TableHead>VAL Date</TableHead>
            <TableHead>Status</TableHead>
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
                    ? `${formatDate(valHeader.planYearBeginDate)} - ${formatDate(valHeader.planYearEndDate)}`
                    : '-'}
                </TableCell>
                <TableCell>{formatDate(valHeader.valDate)}</TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                    getStatusBadge(valHeader.valstatusId)
                  )}>
                    {getStatusLabel(valHeader.valstatusId)}
                  </span>
                </TableCell>
                <TableCell>{formatDate(valHeader.finalizeDate)}</TableCell>
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
      <ValBuilderDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} valHeader={selectedValHeader} />
    </div>
  );
};
