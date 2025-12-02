import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MonthDayCalendar } from '@/components/ui/MonthDayCalendar';
import { useCreateValHeader } from '@/hooks/api/useValHeaders';
import { Plus } from 'lucide-react';

export function CreateValDialog({ planId, onCreated }: Readonly<{ planId: number | null; onCreated?: () => void }>) {
    const [open, setOpen] = useState(false);
    const [valDescription, setValDescription] = useState('');
    const [planYearBeginDate, setPlanYearBeginDate] = useState('');
    const [planYearEndDate, setPlanYearEndDate] = useState('');
    const [valYear, setValYear] = useState('');
    const [valQuarter, setValQuarter] = useState('');
    const createVal = useCreateValHeader();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validate MM/dd format for dates
        const mmddRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;
        if (planYearBeginDate && !mmddRegex.test(planYearBeginDate)) {
            alert('Plan Year Begin Date must be in MM/dd format');
            return;
        }
        if (planYearEndDate && !mmddRegex.test(planYearEndDate)) {
            alert('Plan Year End Date must be in MM/dd format');
            return;
        }
        // Convert MM/dd and valYear to ISO date strings
        const [beginMonth, beginDay] = planYearBeginDate.split('/').map(Number);
        const [endMonth, endDay] = planYearEndDate.split('/').map(Number);
        const year = Number(valYear);
        let endYear = year;
        // If end date is before begin date, increment end year
        if (endMonth < beginMonth || (endMonth === beginMonth && endDay < beginDay)) {
            endYear = year + 1;
        }
        const beginDateIso = `${year}-${beginMonth.toString().padStart(2, '0')}-${beginDay.toString().padStart(2, '0')}T00:00:00`;
        const endDateIso = `${endYear}-${endMonth.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}T00:00:00`;

        await createVal.mutateAsync({
            planId: planId!,
            valDescription,
            valDate: null,
            planYearBeginDate: beginDateIso,
            planYearEndDate: endDateIso,
            recipientName: null,
            recipientAddress1: null,
            recipientAddress2: null,
            recipientCity: null,
            recipientState: null,
            recipientZip: null,
            finalizeDate: null,
            finalizedBy: null,
            wordDocPath: null,
            valstatusId: null,
            marginLeftRight: null,
            marginTopBottom: null,
            fontSize: null,
            valYear: year,
            valQuarter: Number(valQuarter),
        });
        setOpen(false);
        setValDescription('');
        setPlanYearBeginDate('');
        setPlanYearEndDate('');
        setValYear('');
        setValQuarter('');
        onCreated?.();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New VAL
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Valuation Letter</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="val-description">Description</Label>
                        <Input id="val-description" value={valDescription} onChange={e => setValDescription(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="plan-year-begin-date">Plan Year Begin Date (MM/dd)</Label>
                        <MonthDayCalendar
                            value={planYearBeginDate}
                            onChange={setPlanYearBeginDate}
                            placeholder="Select begin date"
                        />
                    </div>
                    <div>
                        <Label htmlFor="plan-year-end-date">Plan Year End Date (MM/dd)</Label>
                        <MonthDayCalendar
                            value={planYearEndDate}
                            onChange={setPlanYearEndDate}
                            placeholder="Select end date"
                        />
                    </div>
                    <div>
                        <Label htmlFor="val-year">VAL Year</Label>
                        <select
                            id="val-year"
                            value={valYear}
                            onChange={e => setValYear(e.target.value)}
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="" disabled>Select year</option>
                            {Array.from({ length: 5 }, (_, i) => {
                                const year = new Date().getFullYear() - 2 + i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="val-quarter">VAL Quarter</Label>
                        <select
                            id="val-quarter"
                            value={valQuarter}
                            onChange={e => setValQuarter(e.target.value)}
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="" disabled>Select quarter</option>
                            {[1, 2, 3, 4].map(q => (
                                <option key={q} value={q}>{q}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit">Create</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
