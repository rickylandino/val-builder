import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useCreateCompanyPlan } from '@/hooks/api/useCompanyPlans';

export function CreateCompanyPlanDialog(
  { companyId, onCreated }: Readonly<{ companyId: number | null; onCreated?: () => void }>
) {
  const [open, setOpen] = useState(false);
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [planYearEnd, setPlanYearEnd] = useState('');
  const createPlan = useCreateCompanyPlan(companyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate MM/dd format
    const mmDdRegex = /^(0[1-9]|1[0-2])\/(\d{2})$/;
    if (planYearEnd && !mmDdRegex.test(planYearEnd)) {
      alert('Plan Year End must be in MM/dd format');
      return;
    }
    await createPlan.mutateAsync({ planName, description, planYearEnd });
    setOpen(false);
    setPlanName('');
    setDescription('');
    setPlanYearEnd('');
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">New Plan</Button>
      </DialogTrigger>
      <DialogContent aria-describedby="company-plan-dialog-desc">
        <DialogHeader>
          <DialogTitle>Create Company Plan</DialogTitle>
        </DialogHeader>
        <div id="company-plan-dialog-desc" className="text-muted-foreground mb-2">
          Fill out the details to create a new company plan.
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="plan-name">Plan Name</Label>
            <Input id="plan-name" value={planName} onChange={e => setPlanName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="plan-description">Description</Label>
            <Input id="plan-description" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="plan-year-end">Plan Year End (MM/YY)</Label>
            <Input
              id="plan-year-end"
              value={planYearEnd}
              onChange={e => setPlanYearEnd(e.target.value)}
              placeholder="MM/DD"
              pattern="^(0[1-9]|1[0-2])/(\d{2})$"
              title="Format: MM/dd"
              required
            />
          </div>
          <Button type="submit" disabled={createPlan.isPending}>Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
