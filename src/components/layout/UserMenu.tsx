import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { logout } from '@/features/auth/authSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function UserMenu() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.name ||
    (user?.email ? user.email.split('@')[0] : 'Super Admin');

  // Dynamic avatar initial: first letter of name or email, defaulting to 'A'
  const avatarLetter = (
    user?.first_name?.trim().charAt(0) ||
    user?.name?.trim().charAt(0) ||
    user?.email?.trim().charAt(0) ||
    'A'
  ).toUpperCase();

  const roleDisplay = (user?.role || 'super_admin').replace(/_/g, ' ');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2.5 px-2 py-1.5 h-auto rounded-full hover:bg-accent"
        >
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            {user?.avatar && <AvatarImage src={user.avatar} alt={displayName} />}
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs uppercase select-none">
              {avatarLetter}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground line-clamp-1">
              {displayName}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
              {roleDisplay}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email || 'admin@gmail.com'}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate('/dashboard/profile')}
        >
          <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
