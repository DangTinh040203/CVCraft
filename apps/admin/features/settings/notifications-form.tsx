'use client';

import { Label } from '@repo/ui/components/label';
import { Switch } from '@repo/ui/components/switch';
import { useState } from 'react';
import { toast } from 'sonner';

const items = [
  {
    id: 'new-signups',
    label: 'New user sign-ups',
    description: 'Get notified whenever a new user creates an account.',
  },
  {
    id: 'export-failures',
    label: 'PDF export failures',
    description: 'Get notified when the export pipeline errors out.',
  },
  {
    id: 'ai-cost-alerts',
    label: 'AI cost alerts',
    description: 'Get notified when Gemini spend crosses a threshold.',
  },
] as const;

export function NotificationsForm() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    'new-signups': true,
    'export-failures': true,
    'ai-cost-alerts': false,
  });

  return (
    <div className='space-y-6'>
      {items.map((item) => (
        <div key={item.id} className='flex items-center justify-between gap-4'>
          <div className='space-y-0.5'>
            <Label htmlFor={item.id}>{item.label}</Label>
            <p className='text-muted-foreground text-sm'>
              {item.description}
            </p>
          </div>
          <Switch
            id={item.id}
            checked={enabled[item.id]}
            onCheckedChange={(checked) => {
              setEnabled((current) => ({ ...current, [item.id]: checked }));
              toast.success('Notification preferences updated');
            }}
          />
        </div>
      ))}
    </div>
  );
}
