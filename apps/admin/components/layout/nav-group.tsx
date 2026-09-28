'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@repo/ui/components/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@repo/ui/components/sidebar';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  type NavCollapsible,
  type NavGroup as NavGroupProps,
  type NavItem,
  type NavLink,
} from '@/components/layout/types';

export function NavGroup({ title, items }: NavGroupProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url ?? ''}`;

          if (!item.items) {
            return (
              <SidebarMenuLink key={key} item={item} pathname={pathname} />
            );
          }

          return (
            <SidebarMenuCollapsible
              key={key}
              item={item}
              pathname={pathname}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function SidebarMenuLink({
  item,
  pathname,
}: {
  item: NavLink;
  pathname: string;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={checkIsActive(pathname, item)}
        tooltip={item.title}
      >
        <Link href={item.url}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarMenuCollapsible({
  item,
  pathname,
}: {
  item: NavCollapsible;
  pathname: string;
}) {
  return (
    <Collapsible
      asChild
      defaultOpen={checkIsActive(pathname, item, true)}
      className='group/collapsible'
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight className={`
              ms-auto transition-transform duration-200
              group-data-[state=open]/collapsible:rotate-90
            `} />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === subItem.url}
                >
                  <Link href={subItem.url}>
                    {subItem.icon && <subItem.icon />}
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function checkIsActive(pathname: string, item: NavItem, mainNav = false) {
  return (
    pathname === item.url ||
    !!item?.items?.some((i) => i.url === pathname) ||
    (mainNav &&
      pathname.split('/')[1] !== '' &&
      pathname.split('/')[1] === item?.url?.split('/')[1])
  );
}
