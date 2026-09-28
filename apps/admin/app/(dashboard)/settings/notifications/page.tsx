import { NotificationsForm } from '@/features/settings/notifications-form';

export default function NotificationsSettingsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Notifications</h3>
        <p className='text-muted-foreground text-sm'>
          Choose which operational alerts you want to receive.
        </p>
      </div>
      <NotificationsForm />
    </div>
  );
}
