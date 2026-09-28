'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Main } from '@/components/layout/main';
import { SiteHeader } from '@/components/layout/site-header';
import { initialUsers } from '@/features/users/data';
import { UsersTable } from '@/features/users/table';

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);

  return (
    <>
      <SiteHeader title='Users' />
      <Main>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Users</h2>
          <p className='text-muted-foreground'>
            Manage accounts, review resume counts, and moderate access.
          </p>
        </div>
        <UsersTable
          data={users}
          onToggleSuspend={(id) => {
            setUsers((current) =>
              current.map((user) =>
                user.id === id
                  ? {
                      ...user,
                      status:
                        user.status === 'active' ? 'suspended' : 'active',
                    }
                  : user,
              ),
            );
            toast.success('User status updated');
          }}
        />
      </Main>
    </>
  );
}
