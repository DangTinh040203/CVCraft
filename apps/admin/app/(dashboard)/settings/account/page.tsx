import { AccountForm } from '@/features/settings/account-form';

export default function AccountSettingsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Account</h3>
        <p className='text-muted-foreground text-sm'>
          Update your account language and timezone.
        </p>
      </div>
      <AccountForm />
    </div>
  );
}
