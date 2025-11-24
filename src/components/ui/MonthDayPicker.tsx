import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const days = Array.from({ length: 31 }, (_, i) => {
  const day = (i + 1).toString().padStart(2, '0');
  return { value: day, label: day };
});

export function MonthDayPicker({ label, value, onChange, required = false }: Readonly<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}>) {
  const [month, day] = value.split('/');

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Select
          value={month || ''}
          onValueChange={m => onChange(`${m}/${day || ''}`)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map(m => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={day || ''}
          onValueChange={d => onChange(`${month || ''}/${d}`)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            {days.map(d => (
              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
