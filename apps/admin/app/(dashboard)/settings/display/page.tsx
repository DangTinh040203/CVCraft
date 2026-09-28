import { DisplayForm } from '@/features/settings/display-form';

export default function DisplaySettingsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Display</h3>
        <p className='text-muted-foreground text-sm'>
          Turn items on or off to control what&apos;s shown in the app.
        </p>
      </div>
      <DisplayForm />
    </div>
  );
}
