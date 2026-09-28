import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@repo/ui/components/sidebar';
import { LayoutDashboard } from 'lucide-react';

export function AppTitle() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg' className={`
          cursor-default
          hover:bg-transparent
        `}>
          <div className={`
            bg-sidebar-primary text-sidebar-primary-foreground flex
            aspect-square size-8 items-center justify-center rounded-lg
          `}>
            <LayoutDashboard className='size-4' />
          </div>
          <div className='grid flex-1 text-start text-sm leading-tight'>
            <span className='truncate font-semibold'>Resume Builder</span>
            <span className='truncate text-xs'>Admin</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
