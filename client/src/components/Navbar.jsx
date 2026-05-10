import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="container-centered h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <img src="/favicon.png" alt="Splitify Logo" className="w-8 h-8 group-hover:scale-105 transition-transform drop-shadow-sm" />
          <span className="text-lg font-bold tracking-tight text-foreground">Splitify</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Button asChild variant="default" size="sm" rounded="full" className="hidden sm:flex gap-2 font-bold shadow-sm h-9 px-4">
            <Link to="/groups/new">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New Group
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden ring-offset-background transition-all hover:ring-2 hover:ring-primary/20">
                <Avatar className="h-full w-full">
                  <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">{initial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2 rounded-xl p-1.5 shadow-xl border-gray-100" align="end" forceMount>
              <DropdownMenuLabel className="font-normal px-3 py-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-foreground leading-none">{user?.name}</p>
                  <p className="text-[10px] font-medium leading-none text-muted-foreground truncate mt-1">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-50" />
              <DropdownMenuItem className="rounded-lg cursor-pointer py-2 px-3 font-bold text-xs focus:bg-primary/5 focus:text-primary transition-colors">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer py-2 px-3 font-bold text-xs focus:bg-primary/5 focus:text-primary transition-colors">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-50" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="rounded-lg cursor-pointer py-2 px-3 text-destructive focus:bg-destructive/10 focus:text-destructive font-bold text-xs transition-colors"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;