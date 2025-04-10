import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Record from "@/pages/record";
import Discover from "@/pages/discover";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import SideNavigation from "@/components/side-navigation";
import ProfileSidebar from "@/components/profile-sidebar";
import BottomNavigation from "@/components/bottom-navigation";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { useMediaQuery } from "@/hooks/use-media-query";

function Router() {
  const [location] = useLocation();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 768px)");
  
  // Don't show mobile navigation on certain pages
  const showMobileNavigation = !isTablet && 
    location !== "/record" && 
    location !== "/admin" && 
    location !== "/auth";
  
  // Full-screen pages (no sidebars)
  const isFullScreenPage = location === "/auth" || 
    location === "/record" || 
    location === "/admin";
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left sidebar navigation - hidden on fullscreen pages */}
      {!isFullScreenPage && <SideNavigation />}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <Switch>
          <Route path="/" component={Home} />
          <ProtectedRoute path="/record" component={Record} />
          <Route path="/discover" component={Discover} />
          <ProtectedRoute path="/profile" component={Profile} />
          <ProtectedRoute path="/profile/:id" component={Profile} />
          <ProtectedRoute path="/admin" component={Admin} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
      
      {/* Right profile sidebar - only shown on desktop and not on fullscreen pages */}
      {isDesktop && !isFullScreenPage && <ProfileSidebar />}
      
      {/* Mobile bottom navigation */}
      {showMobileNavigation && <BottomNavigation />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
