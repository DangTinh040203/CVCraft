'use client';

import { Button } from '@repo/ui/components/button';
import { Label } from '@repo/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group';
import { useState } from 'react';
import { toast } from 'sonner';

const items = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'users', label: 'Users' },
] as const;

export function DisplayForm() {
  const [defaultPage, setDefaultPage] = useState<string>('dashboard');

  return (
    <div className='space-y-6'>
      <div>
        <h4 className='mb-4 text-sm font-medium'>Default landing page</h4>
        <RadioGroup value={defaultPage} onValueChange={setDefaultPage}>
          {items.map((item) => (
            <div key={item.id} className='flex items-center gap-2'>
              <RadioGroupItem value={item.id} id={item.id} />
              <Label htmlFor={item.id}>{item.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <Button onClick={() => toast.success('Display preferences updated')}>
        Update display
      </Button>
    </div>
  );
}
