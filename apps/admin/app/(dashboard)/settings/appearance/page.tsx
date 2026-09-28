import { AppearanceForm } from '@/features/settings/appearance-form';

export default function AppearanceSettingsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Appearance</h3>
        <p className='text-muted-foreground text-sm'>
          Customize how the admin app looks.
        </p>
      </div>
      <AppearanceForm />
    </div>
  );
}
