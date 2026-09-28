import { ProfileForm } from '@/features/settings/profile-form';

export default function ProfileSettingsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Profile</h3>
        <p className='text-muted-foreground text-sm'>
          This is how others will see you in the admin app.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
