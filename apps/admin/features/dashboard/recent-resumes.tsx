import { Avatar, AvatarFallback } from '@repo/ui/components/avatar';

const recent = [
  { name: 'Olivia Martin', email: 'olivia.martin@email.com', template: 'Modern' },
  { name: 'Jackson Lee', email: 'jackson.lee@email.com', template: 'Classic' },
  { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', template: 'Elegant' },
  { name: 'William Kim', email: 'will@email.com', template: 'Compact' },
  { name: 'Sofia Davis', email: 'sofia.davis@email.com', template: 'Executive' },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function RecentResumes() {
  return (
    <div className='space-y-6'>
      {recent.map((item) => (
        <div key={item.email} className='flex items-center gap-4'>
          <Avatar className='size-9'>
            <AvatarFallback>{initials(item.name)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>{item.name}</p>
              <p className='text-muted-foreground text-sm'>{item.email}</p>
            </div>
            <div className='text-sm font-medium'>{item.template}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
