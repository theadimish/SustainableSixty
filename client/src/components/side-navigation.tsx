import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SideNavigation() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Sidebar links
  const menuItems = [
    { path: "/", label: "Home", icon: "home" },
    { path: "/discover", label: "Discover", icon: "explore" },
    { path: "/record", label: "Record", icon: "videocam" },
    { path: user ? `/profile` : "/auth", label: user ? "My Profile" : "Sign In", icon: user ? "person" : "login" },
  ];
  
  // Only show admin link for admin users
  if (user && user.role === "admin") {
    menuItems.push({ path: "/admin", label: "Admin", icon: "admin_panel_settings" });
  }

  return (
    <div className={`bg-white border-r border-gray-200 ${isMobile ? 'w-16' : 'w-64'} flex flex-col`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 flex items-center">
        <div className="bg-primary text-white p-2 rounded-lg mr-2">
          <span className="material-icons">eco</span>
        </div>
        {!isMobile && <span className="font-bold text-lg">EcoSnap</span>}
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                href={item.path}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  location === item.path 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="material-icons mr-3">{item.icon}</span>
                {!isMobile && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
          
          {/* Weekly Challenge */}
          <li className="mt-6">
            <div className={`p-3 bg-primary/5 rounded-lg ${isMobile ? 'hidden' : 'block'}`}>
              <div className="flex items-center text-primary mb-2">
                <span className="material-icons mr-2">emoji_events</span>
                <span className="font-semibold">Weekly Challenge</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">Show us your plastic-free grocery haul!</p>
              <Button size="sm" variant="outline" className="w-full text-xs">
                Join Challenge
              </Button>
            </div>
          </li>
        </ul>
      </nav>
      
      {/* User section at bottom */}
      {user && (
        <div className={`p-4 border-t border-gray-200 flex items-center ${isMobile ? 'justify-center' : ''}`}>
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={user.profileImage || undefined} alt={user.displayName} />
            <AvatarFallback>{user.displayName.substring(0, 2)}</AvatarFallback>
          </Avatar>
          {!isMobile && (
            <>
              <div className="flex-1 ml-2">
                <p className="text-sm font-medium">{user.displayName}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="ml-2 px-2 text-red-600" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <span className="material-icons text-sm">logout</span>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}