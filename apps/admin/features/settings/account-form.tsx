'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const accountFormSchema = z.object({
  language: z.enum(['en', 'vi']),
  timezone: z.string(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export function AccountForm() {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: { language: 'en', timezone: 'UTC' },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(() => toast.success('Account updated'))}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='language'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='en'>English</SelectItem>
                  <SelectItem value='vi'>Tiếng Việt</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Only affects the admin app&apos;s own UI.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='timezone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='UTC'>UTC</SelectItem>
                  <SelectItem value='Asia/Ho_Chi_Minh'>
                    Asia/Ho Chi Minh
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>Update account</Button>
      </form>
    </Form>
  );
}
