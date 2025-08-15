import { ShoppingCart, Plus, User, LogOut, Settings, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import CurrencySelector from "@/components/CurrencySelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GroceryHeaderProps {
  onAddClick?: () => void;
  showAddButton?: boolean;
}

const GroceryHeader = ({ onAddClick, showAddButton = false }: GroceryHeaderProps) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'admin':
        return '👑 Admin';
      case 'category_manager':
        return '📦 Category Manager';
      case 'student':
        return '🎓 Student';
      default:
        return '👤 Anonymous';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div 
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate('/')}
      >
        <div className="grocery-gradient p-3 rounded-xl">
          <ShoppingCart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grocery Simplified</h1>
          <p className="text-gray-600">Smart shopping for students</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Currency Selector - Always visible */}
        <CurrencySelector compact />
        
        {showAddButton && onAddClick && (
          <Button 
            onClick={onAddClick}
            className="grocery-gradient text-white hover:opacity-90 transition-opacity shadow-lg"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add to List
          </Button>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{profile?.full_name || profile?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  <p className="text-xs text-muted-foreground">{getRoleDisplay(profile?.role)}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {profile?.role === 'admin' && (
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </DropdownMenuItem>
              )}
              
              {profile?.role === 'category_manager' && (
                <DropdownMenuItem onClick={() => navigate('/categories')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Categories
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={() => navigate('/')}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                My Grocery List
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate('/budget')}>
                <DollarSign className="w-4 h-4 mr-2" />
                Budget Management
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate('/groups')}>
                <Users className="w-4 h-4 mr-2" />
                My Groups
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            onClick={() => navigate('/auth')}
            variant="outline"
          >
            <User className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>
    </div>
  );
};

export default GroceryHeader;