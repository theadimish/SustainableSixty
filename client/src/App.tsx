import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Record from "@/pages/record";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import BottomNavigation from "@/components/bottom-navigation";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  const [location] = useLocation();
  
  // Don't show navigation on the record page and auth pages
  const showNavigation = location !== "/record" && location !== "/admin" && location !== "/auth";
  
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <ProtectedRoute path="/record" component={Record} />
        <Route path="/leaderboard" component={Leaderboard} />
        <ProtectedRoute path="/profile" component={Profile} />
        <ProtectedRoute path="/profile/:id" component={Profile} />
        <ProtectedRoute path="/admin" component={Admin} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
      
      {showNavigation && <BottomNavigation />}
    </>
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
