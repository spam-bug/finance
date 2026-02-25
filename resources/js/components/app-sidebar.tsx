import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from '@/components/ui/sidebar';
import { type Auth } from '@/types';
import { usePage } from '@inertiajs/react';
import { BarChart2, Landmark, LayoutDashboard, PiggyBank, Receipt, Target, TrendingUp, Wallet } from 'lucide-react';
import * as React from 'react';

const navItems = [
    {
        title: 'Dashboard',
        url: '/',
        icon: LayoutDashboard,
    },
    {
        title: 'Accounts',
        url: '/accounts',
        icon: Wallet,
    },
    {
        title: 'Transactions',
        url: '/transactions',
        icon: Receipt,
        items: [
            { title: 'Income', url: '/transactions/income' },
            { title: 'Expenses', url: '/transactions/expenses' },
        ],
    },
    {
        title: 'Credits',
        url: '/credits',
        icon: Landmark,
    },
    {
        title: 'Savings',
        url: '/savings',
        icon: PiggyBank,
    },
    {
        title: 'Investments',
        url: '/investments',
        icon: TrendingUp,
    },
    {
        title: 'Budgets',
        url: '/budgets',
        icon: Target,
        items: [
            { title: 'Monthly Budgets', url: '/budgets' },
            { title: 'Goals', url: '/goals' },
        ],
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Wallet className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">Finance Tracker</span>
                                    <span className="text-muted-foreground truncate text-xs">Personal Finance</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={auth.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
