import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, FileText, Info, HelpCircle, User, LogOut, Download, Crown, Menu, X, Layout } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const ResumeBuilderNavbar = () => {
  const { user, signOut } = useAuth();
  const { isFreeTier } = useSubscription();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUpgradeClick = () => {
    navigate('/upgrade');
  };

  const NavItems = () => (
    <>
      <Link 
        to="/resume-builder"
        className="hidden md:flex items-center space-x-1 font-medium bg-gradient-to-r from-purple-600 to-blue-500 text-white px-3 py-1.5 rounded-md animate-glow hover:shadow-lg transition-all duration-200 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700"
      >
        <FileText className="h-4 w-4" />
        <span>AI Builder</span>
      </Link>
      <Link 
        to="/#hero" 
        className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors font-medium"
        onClick={(e) => {
          e.preventDefault();
          setIsMobileMenuOpen(false);
          const currentPath = window.location.pathname;
          
          if (currentPath === '/') {
            document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            navigate('/?scrollTo=hero');
            setTimeout(() => {
              document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }}
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </Link>
      <Link 
        to="/templates" 
        className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors font-medium"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Layout className="h-4 w-4" />
        <span>Templates</span>
      </Link>
      <a 
        href="#about" 
        className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors font-medium"
        onClick={(e) => {
          e.preventDefault();
          setIsMobileMenuOpen(false);
          const currentPath = window.location.pathname;
          
          if (currentPath === '/') {
            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            navigate('/');
            setTimeout(() => {
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }}
      >
        <Info className="h-4 w-4" />
        <span>About</span>
      </a>
      <Link 
        to="/#help" 
        className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors font-medium"
        onClick={(e) => {
          e.preventDefault();
          setIsMobileMenuOpen(false);
          const currentPath = window.location.pathname;
          
          if (currentPath === '/') {
            document.getElementById('help')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            navigate('/?scrollTo=help');
            setTimeout(() => {
              document.getElementById('help')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }}
      >
        <HelpCircle className="h-4 w-4" />
        <span>Help</span>
      </Link>
    </>
  );

  return (
    <nav className="bg-white/60 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
       
        <Link to="/" className="flex items-center space-x-2 ">
          <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            ResumeGuru
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavItems />
        </div>


        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                      <AvatarFallback>{user.email?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                      {isFreeTier ? <p className="text-xs leading-none text-muted-foreground">Free Plan</p> : <p className="text-xs leading-none text-muted-foreground">Premium Plan</p>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/resume-builder" className="flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      <span>Create Resume</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {isFreeTier ? (
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hidden md:flex"
                  onClick={handleUpgradeClick}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  <span>Upgrade</span>
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-pink-500 to-yellow-600 hover:cursor-default text-white shadow-md hover:shadow-lg transition-all duration-200 hidden md:flex"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  <span>Premium User</span>
                </Button>
              )}
            </>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="bg-transparent border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 py-4 px-4 shadow-lg">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/resume-builder"
              className="flex items-center space-x-1 font-medium bg-gradient-to-r from-purple-600 to-blue-500 text-white px-3 py-1.5 rounded-md animate-glow hover:shadow-lg transition-all duration-200 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700 w-fit"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FileText className="h-4 w-4" />
              <span>AI Builder</span>
            </Link>
            <NavItems />
          </div>
        </div>
      )}
    </nav>
  );
};

export default ResumeBuilderNavbar;
