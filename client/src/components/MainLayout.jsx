import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const MainLayout = ({ children, title = "Dashboard" }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#FBFBFC]">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-gray-500 hover:text-primary transition-colors" />
              <div className="h-4 w-px bg-gray-200"></div>
              <h1 className="text-sm font-black text-foreground uppercase tracking-widest">{title}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button asChild size="sm" rounded="full" className="font-black text-[10px] uppercase tracking-widest shadow-sm h-9 px-6 hover:scale-105 transition-all">
                <Link to="/groups/new" className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  New Group
                </Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="container max-w-6xl mx-auto py-10 px-6 md:px-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
