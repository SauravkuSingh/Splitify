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
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../utils/axios";
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
  const location = useLocation();
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (user) {
      api.get('/groups/connections').then(res => {
        setConnections(res.data.connections);
      }).catch(err => console.error("Failed to fetch connections", err));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
    { title: "My Groups", icon: Users, url: "/groups" },
    { title: "Recent Activity", icon: History, url: "/activity" },
    { title: "Analytics", icon: TrendingUp, url: "/analytics" },
  ];

  const quickActions = [
    { title: "Create Group", icon: PlusCircle, url: "/groups/new", color: "text-primary" },
    { title: "Scan Receipt", icon: Receipt, url: "/scan", color: "text-gray-500" },
  ];

  return (
    <Sidebar className="border-r border-gray-100 bg-white">
      <SidebarHeader className="p-6">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <img src="/favicon.png" alt="Splitify Logo" className="w-10 h-10 group-hover:scale-105 transition-all drop-shadow-md" />
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
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`h-11 rounded-lg px-3 transition-all ${
                        isActive 
                          ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20' 
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isActive ? 'font-black' : 'font-semibold'}`}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`h-11 rounded-lg px-3 transition-all ${
                        isActive 
                          ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20' 
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : item.color}`} />
                        <span className={`text-sm ${isActive ? 'font-black' : 'font-semibold'}`}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Connections
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {connections.length === 0 ? (
              <div className="px-3 py-4 text-xs text-center text-muted-foreground italic bg-gray-50/50 rounded-xl mx-2 border border-dashed border-gray-200">
                No past members yet
              </div>
            ) : (
              <SidebarMenu>
                {connections.slice(0, 5).map((connection) => (
                  <SidebarMenuItem key={connection.user._id}>
                    <SidebarMenuButton 
                      asChild 
                      className="h-auto py-2 rounded-lg px-3 transition-all hover:bg-gray-50 text-gray-600 group"
                    >
                      <Link to="/groups/new" className="flex items-center gap-3 w-full">
                        <Avatar className="w-8 h-8 border shadow-sm">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {connection.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="text-sm font-semibold truncate">{connection.user.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {connection.sharedGroups.slice(0, 2).join(', ')}
                            {connection.sharedGroups.length > 2 && '...'}
                          </span>
                        </div>
                        <PlusCircle className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
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
            title="Log out"
          >
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
