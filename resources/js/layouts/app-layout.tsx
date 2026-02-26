import { AppSidebar } from '@/components/app-sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { usePage } from '@inertiajs/react';
import { type ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumb?: string;
}

export default function AppLayout({ children, breadcrumb }: AppLayoutProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string; warning?: string } }>().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success, { id: 'form-processing' });
        if (flash?.error) toast.error(flash.error, { id: 'form-processing' });
        if (flash?.warning) toast.warning(flash.warning, { id: 'form-processing' });
    }, [flash]);

    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            {breadcrumb && (
                                <>
                                    <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                                    <Breadcrumb>
                                        <BreadcrumbList>
                                            <BreadcrumbItem>
                                                <BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
                                            </BreadcrumbItem>
                                        </BreadcrumbList>
                                    </Breadcrumb>
                                </>
                            )}
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
                </SidebarInset>
            </SidebarProvider>
            <Toaster position="top-right" />
        </TooltipProvider>
    );
}
