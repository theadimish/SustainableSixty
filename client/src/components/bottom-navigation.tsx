import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function BottomNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-light flex items-center justify-around py-2 z-10">
      <Link href="/">
        <a className={`flex flex-col items-center p-2 ${location === "/" ? "text-primary" : "text-neutral-medium"}`}>
          <span className="material-icons">home</span>
          <span className="text-xs font-accent mt-1">Home</span>
        </a>
      </Link>
      
      <Link href="/leaderboard">
        <a className={`flex flex-col items-center p-2 ${location === "/leaderboard" ? "text-primary" : "text-neutral-medium"}`}>
          <span className="material-icons">explore</span>
          <span className="text-xs font-accent mt-1">Discover</span>
        </a>
      </Link>
      
      <div className="relative flex flex-col items-center">
        <Link href={user ? "/record" : "/auth"}>
          <a className="absolute -top-8 bg-primary text-white rounded-full p-3 shadow-lg">
            <span className="material-icons">videocam</span>
          </a>
        </Link>
        <span className="text-xs font-accent mt-7 text-neutral-medium">Record</span>
      </div>
      
      <Link href="/leaderboard">
        <a className={`flex flex-col items-center p-2 ${location === "/leaderboard" ? "text-primary" : "text-neutral-medium"}`}>
          <span className="material-icons">leaderboard</span>
          <span className="text-xs font-accent mt-1">Rankings</span>
        </a>
      </Link>
      
      <Link href={user ? "/profile" : "/auth"}>
        <a className={`flex flex-col items-center p-2 ${location === "/profile" || location === "/auth" ? "text-primary" : "text-neutral-medium"}`}>
          <span className="material-icons">{user ? "person" : "login"}</span>
          <span className="text-xs font-accent mt-1">{user ? "Profile" : "Login"}</span>
        </a>
      </Link>
    </nav>
  );
}
