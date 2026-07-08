import { Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { NavLink, useLocation } from 'react-router-dom';
import { MessageSquare, BookOpen, Calculator, FileText, FlaskConical, PenTool, BookMarked, Plus, Search, Settings } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { useIsMobile } from '@/hooks/use-mobile';

export interface IChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

const NAV_ITEMS = [
  { path: '/chat', label: '对话中心', icon: MessageSquare },
  { path: '/literature', label: '文献检索', icon: BookOpen },
  { path: '/data', label: '数据处理', icon: Calculator },
  { path: '/standard', label: '国标查询', icon: FileText },
  { path: '/experiment', label: '实验设计', icon: FlaskConical },
  { path: '/paper', label: '论文辅助', icon: PenTool },
  { path: '/sop', label: '实验SOP', icon: BookMarked },
];

export default function AppSidebar() {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const [sessions, setSessions] = useState<IChatSession[]>(() =>
    storage.get<IChatSession[]>('chat_sessions', [
      { id: '1', title: '真菌毒素检测方法咨询', createdAt: Date.now() - 86400000, updatedAt: Date.now() - 3600000 },
      { id: '2', title: '膳食暴露风险评估计算', createdAt: Date.now() - 172800000, updatedAt: Date.now() - 86400000 },
      { id: '3', title: '正交试验设计方案', createdAt: Date.now() - 259200000, updatedAt: Date.now() - 172800000 },
    ])
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    const newSession: IChatSession = {
      id: Date.now().toString(),
      title: '新对话',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    storage.set('chat_sessions', [newSession, ...sessions]);
  };

  const isChatPage = pathname.startsWith('/chat');

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-0">
        <div className="flex items-center gap-2 px-3 py-3 group-data-[state=collapsed]:px-2 group-data-[state=collapsed]:justify-center">
          <div className="size-8 shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            食
          </div>
          <div className="flex-1 min-w-0 group-data-[state=collapsed]:hidden">
            <div className="text-sm font-semibold truncate text-sidebar-foreground">食品安全科研助手</div>
            <div className="text-xs text-muted-foreground truncate">Food Safety Research Assistant</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* 功能导航 */}
        <SidebarGroup className="p-2">
          <SidebarMenu>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      className="flex items-center gap-2"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* 对话历史（仅对话页展示） */}
        {isChatPage && (
          <div className="px-2 group-data-[state=collapsed]:hidden">
            <div className="flex items-center justify-between px-2 py-2">
              <span className="text-xs font-medium text-muted-foreground">对话历史</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={handleNewChat}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>

            <div className="px-1 pb-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索对话"
                  className="h-8 pl-8 text-xs bg-sidebar-accent/30 border-sidebar-border"
                />
              </div>
            </div>

            <div className="space-y-0.5 max-h-[40vh] overflow-y-auto pr-1">
              {filteredSessions.map((session) => (
                <button
                  key={session.id}
                  className="w-full text-left px-2.5 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors truncate"
                >
                  <span className="block truncate">{session.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </SidebarContent>

      {/* 底部设置 */}
      <div className="p-2 border-t border-sidebar-border group-data-[state=collapsed]:px-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Settings className="size-4 shrink-0" />
          <span className="group-data-[state=collapsed]:hidden ml-2">设置</span>
        </Button>
      </div>
    </Sidebar>
  );
}
