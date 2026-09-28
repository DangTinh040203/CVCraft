'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'Jan', total: 1240 },
  { name: 'Feb', total: 1580 },
  { name: 'Mar', total: 1890 },
  { name: 'Apr', total: 2210 },
  { name: 'May', total: 2430 },
  { name: 'Jun', total: 2680 },
  { name: 'Jul', total: 3020 },
  { name: 'Aug', total: 3190 },
  { name: 'Sep', total: 3410 },
  { name: 'Oct', total: 3780 },
  { name: 'Nov', total: 4120 },
  { name: 'Dec', total: 4502 },
];

export function OverviewChart() {
  return (
    <ResponsiveContainer width='100%' height={320}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Bar dataKey='total' radius={[4, 4, 0, 0]} className='fill-primary' />
      </BarChart>
    </ResponsiveContainer>
  );
}
