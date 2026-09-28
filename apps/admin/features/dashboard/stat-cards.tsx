import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { FileDown, FileText, Sparkles, Users } from 'lucide-react';

const stats = [
  {
    title: 'Total Users',
    value: '1,284',
    change: '+8.2% from last month',
    icon: Users,
  },
  {
    title: 'Total Resumes',
    value: '2,931',
    change: '+14.1% from last month',
    icon: FileText,
  },
  {
    title: 'PDF Exports (30d)',
    value: '4,502',
    change: '+22.4% from last month',
    icon: FileDown,
  },
  {
    title: 'AI Calls (30d)',
    value: '9,845',
    change: '+5.6% from last month',
    icon: Sparkles,
  },
];

export function StatCards() {
  return (
    <div className={`
      grid gap-4
      sm:grid-cols-2
      lg:grid-cols-4
    `}>
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className={`
            flex flex-row items-center justify-between space-y-0 pb-2
          `}>
            <CardTitle className='text-sm font-medium'>
              {stat.title}
            </CardTitle>
            <stat.icon className='text-muted-foreground size-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stat.value}</div>
            <p className='text-muted-foreground text-xs'>{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
