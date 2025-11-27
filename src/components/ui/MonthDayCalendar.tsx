import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getDaysInMonth = (month: number) => {
  // Use a non-leap year to get standard month lengths
  return new Date(2023, month + 1, 0).getDate();
};

export function MonthDayCalendar({ value, onChange, placeholder = 'Select date' }: Readonly<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  'data-testid'?: string;
}>) {
  const [month, day] = value.split('/').map(v => v ? Number.parseInt(v, 10) - 1 : -1);
  const [selectedMonth, setSelectedMonth] = useState(Math.max(month, 0));
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const daysInMonth = getDaysInMonth(selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleDayClick = (dayNum: number) => {
    const monthStr = (selectedMonth + 1).toString().padStart(2, '0');
    const dayStr = dayNum.toString().padStart(2, '0');
    const newValue = `${monthStr}/${dayStr}`;
    onChange(newValue);
    setInputValue(newValue);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Remove any non-digit characters except /
    val = val.replaceAll(/[^\d/]/g, '');
    
    // Auto-insert / after 2 digits for month
    if (val.length === 2 && !val.includes('/')) {
      val = val + '/';
    }
    
    // Limit to MM/dd format (5 characters max)
    if (val.length > 5) {
      val = val.slice(0, 5);
    }
    
    setInputValue(val);
    
    // Validate MM/dd format
    const mmddRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;
    if (mmddRegex.test(val)) {
      onChange(val);
      const [m] = val.split('/').map(v => Number.parseInt(v, 10) - 1);
      setSelectedMonth(m);
    }
  };

  return (
    <div className="relative" data-testid={arguments[0]['data-testid'] || 'month-day-calendar'}>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          pattern="^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])$"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="month-day-input"
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              data-testid="month-day-calendar-trigger"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white border shadow-lg" align="start" sideOffset={5}>
        <div className="p-3 bg-white">
          {/* Month selector */}
          <div className="mb-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number.parseInt(e.target.value, 10))}
              className="w-full p-2 border rounded bg-white"
              data-testid="month-day-calendar-month-select"
            >
              {months.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1" data-testid="month-day-calendar-grid">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
              <div key={d} className="text-center text-sm font-medium text-muted-foreground p-2">
                {d}
              </div>
            ))}
            {days.map((dayNum) => {
              const isSelected = month === selectedMonth && day === dayNum - 1;
              return (
                <button
                  key={dayNum}
                  onClick={() => handleDayClick(dayNum)}
                  className={cn(
                    'p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground',
                    isSelected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                  )}
                  data-testid={`month-day-calendar-day-${dayNum}`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
