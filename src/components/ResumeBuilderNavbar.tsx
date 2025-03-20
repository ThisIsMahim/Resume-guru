import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FileText, Info, HelpCircle, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const ResumeBuilderNavbar = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <nav className="bg-white/60 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center space-x-2">
          <FileText className="h-6 w-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent" />
          <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            ResumeGuru
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors font-medium"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <a 
            href="#" 
            className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors font-medium"
          >
            <Info className="h-4 w-4" />
            <span>About</span>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors font-medium"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help</span>
          </a>
        </div>
        
        <div className="flex items-center space-x-4">
        {user ? (
            <>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-300">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="bg-transparent border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white">
                Sign In
              </Button>
            </Link>
          )}
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            asChild
          >
            <Link to="/resume-builder">
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default ResumeBuilderNavbar;
