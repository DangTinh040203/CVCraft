'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Main } from '@/components/layout/main';
import { SiteHeader } from '@/components/layout/site-header';
import { initialTasks } from '@/features/tasks/data';
import { TasksTable } from '@/features/tasks/table';

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);

  return (
    <>
      <SiteHeader title='Tasks' />
      <Main>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Internal tasks
          </h2>
          <p className='text-muted-foreground'>
            Track work on the admin/back-office side of the product.
          </p>
        </div>
        <TasksTable
          data={tasks}
          onDelete={(id) => {
            setTasks((current) => current.filter((task) => task.id !== id));
            toast.success(`Deleted ${id}`);
          }}
        />
      </Main>
    </>
  );
}
