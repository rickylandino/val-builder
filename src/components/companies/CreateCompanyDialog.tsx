import { useState } from 'react';
import { useCreateCompany } from '@/hooks/api/useCompanies';
import type { CreateCompany } from '@/types/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Sparkles } from 'lucide-react';

const generateRandomCompany = (): Omit<CreateCompany, 'companyId'> => {
  const companies = [
    'Tech Solutions', 'Global Innovations', 'Future Systems', 'Digital Ventures',
    'Smart Industries', 'Advanced Technologies', 'Prime Enterprises', 'Elite Partners'
  ];
  const streets = [
    'Oak Street', 'Main Avenue', 'Park Boulevard', 'Cedar Lane',
    'Maple Drive', 'River Road', 'Forest Way', 'Mountain View'
  ];
  const cities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Austin'
  ];
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'NC', 'GA'];

  const randomCompanyName = companies[Math.floor(Math.random() * companies.length)];
  const randomStreet = streets[Math.floor(Math.random() * streets.length)];
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  const randomState = states[Math.floor(Math.random() * states.length)];
  const randomNumber = Math.floor(Math.random() * 9000) + 1000;

  return {
    name: `${randomCompanyName} ${randomNumber}`,
    mailingName: `${randomCompanyName} ${randomNumber} Inc.`,
    street1: `${randomNumber} ${randomStreet}`,
    street2: Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 900) + 100}` : null,
    city: randomCity,
    state: randomState,
    zip: `${Math.floor(Math.random() * 90000) + 10000}`,
    phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    fax: Math.random() > 0.5 ? `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}` : null,
  };
};

export const CreateCompanyDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<CreateCompany, 'companyId'>>({
    name: '',
    mailingName: '',
    street1: '',
    street2: null,
    city: '',
    state: '',
    zip: '',
    phone: '',
    fax: null,
  });

  const { mutate: createCompany, isPending } = useCreateCompany();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompany(formData, {
      onSuccess: () => {
        setOpen(false);
        setFormData({
          name: '',
          mailingName: '',
          street1: '',
          street2: null,
          city: '',
          state: '',
          zip: '',
          phone: '',
          fax: null,
        });
      },
    });
  };

  const handlePrefill = () => {
    setFormData(generateRandomCompany());
  };

  const handleChange = (field: keyof CreateCompany) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value || null,
    }));
  };

  const isDevelopment = import.meta.env.DEV;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-sm bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/90">
          <Plus className="mr-2 h-4 w-4" />
          New Company
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
          <DialogDescription>
            Add a new company to the system. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="col-span-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={handleChange('name')}
                placeholder="Acme Corporation"
                required
              />
            </div>

            {/* Mailing Name */}
            <div className="col-span-2">
              <Label htmlFor="mailingName">Mailing Name</Label>
              <Input
                id="mailingName"
                value={formData.mailingName || ''}
                onChange={handleChange('mailingName')}
                placeholder="Acme Corp."
              />
            </div>

            {/* Street 1 */}
            <div className="col-span-2">
              <Label htmlFor="street1">Street Address</Label>
              <Input
                id="street1"
                value={formData.street1 || ''}
                onChange={handleChange('street1')}
                placeholder="123 Main Street"
              />
            </div>

            {/* Street 2 */}
            <div className="col-span-2">
              <Label htmlFor="street2">Street Address 2</Label>
              <Input
                id="street2"
                value={formData.street2 || ''}
                onChange={handleChange('street2')}
                placeholder="Suite 100"
              />
            </div>

            {/* City */}
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={handleChange('city')}
                placeholder="New York"
              />
            </div>

            {/* State */}
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state || ''}
                onChange={handleChange('state')}
                placeholder="NY"
                maxLength={2}
              />
            </div>

            {/* Zip */}
            <div>
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={formData.zip || ''}
                onChange={handleChange('zip')}
                placeholder="10001"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={handleChange('phone')}
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Fax */}
            <div className="col-span-2">
              <Label htmlFor="fax">Fax</Label>
              <Input
                id="fax"
                value={formData.fax || ''}
                onChange={handleChange('fax')}
                placeholder="(555) 123-4568"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {isDevelopment && (
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrefill}
                className="mr-auto"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Prefill Random Data
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !formData.name}
              className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/90"
            >
              {isPending ? 'Creating...' : 'Create Company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
