import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';

import { Main } from '@/components/layout/main';
import { SiteHeader } from '@/components/layout/site-header';
import { OverviewChart } from '@/features/dashboard/overview-chart';
import { RecentResumes } from '@/features/dashboard/recent-resumes';
import { StatCards } from '@/features/dashboard/stat-cards';

export default function DashboardPage() {
  return (
    <>
      <SiteHeader title='Dashboard' />
      <Main>
        <StatCards />
        <div className={`
          grid grid-cols-1 gap-4
          lg:grid-cols-7
        `}>
          <Card className={`
            col-span-1
            lg:col-span-4
          `}>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>PDF exports over the last 12 months.</CardDescription>
            </CardHeader>
            <CardContent className='ps-2'>
              <OverviewChart />
            </CardContent>
          </Card>
          <Card className={`
            col-span-1
            lg:col-span-3
          `}>
            <CardHeader>
              <CardTitle>Recent Resumes</CardTitle>
              <CardDescription>Latest resumes created across all users.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentResumes />
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  );
}
