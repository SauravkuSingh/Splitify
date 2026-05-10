import { 
  LayoutDashboard, 
  Users, 
  History, 
  Settings, 
  LogOut,
  PlusCircle,
  TrendingUp,
  Receipt
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
    { title: "My Groups", icon: Users, url: "/dashboard" },
    { title: "Recent Activity", icon: History, url: "/dashboard" },
    { title: "Analytics", icon: TrendingUp, url: "/dashboard" },
  ];

  return (
    <Sidebar className="border-r border-gray-100 bg-white">
      <SidebarHeader className="p-6">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Splitify</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11 rounded-lg px-3 hover:bg-gray-50 transition-colors">
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-gray-500" />
                      <span className="font-semibold text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11 rounded-lg px-3 hover:bg-gray-50 transition-colors">
                  <Link to="/groups/new" className="flex items-center gap-3">
                    <PlusCircle className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-sm">Create Group</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-11 rounded-lg px-3 hover:bg-gray-50 transition-colors">
                  <Receipt className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold text-sm">Scan Receipt</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto border-t border-gray-50">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50/50">
          <Avatar className="w-9 h-9 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
            <p className="text-[10px] font-medium text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
          >
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
