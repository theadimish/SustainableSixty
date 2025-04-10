import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@shared/schema";

export default function ProfileSidebar() {
  const { user } = useAuth();
  
  // Fetch top users for suggested follows
  const { data: topUsers } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
    queryFn: async () => {
      const response = await fetch("/api/leaderboard?limit=5");
      if (!response.ok) throw new Error("Failed to fetch top users");
      return response.json();
    },
  });
  
  return (
    <div className="w-80 p-4 border-l border-gray-200 bg-white overflow-auto">
      {/* If user is logged in, show profile summary */}
      {user ? (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profileImage || undefined} alt={user.displayName} />
                <AvatarFallback>{user.displayName.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <h4 className="font-medium">{user.displayName}</h4>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-sm font-medium">{user.points}</p>
                <p className="text-xs text-gray-500">Points</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-sm font-medium">0</p>
                <p className="text-xs text-gray-500">Videos</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button 
                className="w-full" 
                size="sm"
                variant="outline"
                onClick={() => window.location.href = "/profile"}
              >
                Profile
              </Button>
              <Button 
                className="w-full" 
                size="sm"
                variant="outline"
                onClick={() => window.location.href = "/profile?tab=saved"}
              >
                Saved Videos
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Join EcoSnap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Share your sustainability stories and connect with others making a difference.</p>
            <Button 
              className="w-full"
              onClick={() => window.location.href = "/auth"}
            >
              Sign Up or Login
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Popular Topics */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Popular Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-50 hover:bg-green-100 cursor-pointer">
              #energy
            </Badge>
            <Badge variant="outline" className="bg-blue-50 hover:bg-blue-100 cursor-pointer">
              #waste
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 hover:bg-yellow-100 cursor-pointer">
              #biodiversity
            </Badge>
            <Badge variant="outline" className="bg-purple-50 hover:bg-purple-100 cursor-pointer">
              #sustainable-fashion
            </Badge>
            <Badge variant="outline" className="bg-red-50 hover:bg-red-100 cursor-pointer">
              #climate-justice
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      {/* Suggested users to follow */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Suggested Users</CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          {topUsers ? (
            <ul className="space-y-3">
              {topUsers.slice(0, 5).map((topUser) => (
                <li key={topUser.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={topUser.profileImage || undefined} alt={topUser.displayName} />
                    <AvatarFallback>{topUser.displayName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-2 flex-1">
                    <p className="text-sm font-medium">{topUser.displayName}</p>
                    <p className="text-xs text-gray-500">{topUser.points} points</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="material-icons text-sm">person_add</span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-4 text-center text-sm text-gray-500">
              Loading suggested users...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}