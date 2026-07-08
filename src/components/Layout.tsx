import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-w-0 overflow-x-hidden bg-background">
        {/* 顶部栏 */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-md px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Bell className="size-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=default" alt="用户头像" />
              <AvatarFallback>
                <User className="size-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* 主内容区 */}
        <main className="flex-1 w-full overflow-y-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
