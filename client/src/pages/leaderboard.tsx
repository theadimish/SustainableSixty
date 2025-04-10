import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import AppHeader from "@/components/app-header";

// Tab periods for the leaderboard
type PeriodTab = "weekly" | "monthly" | "all-time";

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<PeriodTab>("weekly");
  
  // Fetch leaderboard data
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });

  // Sort leaders by position
  const topThreeUsers = users?.slice(0, 3) || [];
  const remainingUsers = users?.slice(3) || [];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-lightest">
      <AppHeader title="EcoRanking" icon="leaderboard" />
      
      {/* Period tabs */}
      <div className="bg-white border-b border-neutral-light px-4 py-2">
        <div className="flex rounded-lg overflow-hidden border border-neutral-light divide-x divide-neutral-light">
          <button 
            className={`flex-1 py-2 font-accent ${activeTab === "weekly" ? "bg-primary text-white" : "bg-white text-neutral-dark"}`}
            onClick={() => setActiveTab("weekly")}
          >
            Weekly
          </button>
          <button 
            className={`flex-1 py-2 font-accent ${activeTab === "monthly" ? "bg-primary text-white" : "bg-white text-neutral-dark"}`}
            onClick={() => setActiveTab("monthly")}
          >
            Monthly
          </button>
          <button 
            className={`flex-1 py-2 font-accent ${activeTab === "all-time" ? "bg-primary text-white" : "bg-white text-neutral-dark"}`}
            onClick={() => setActiveTab("all-time")}
          >
            All Time
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Top Leaders Podium */}
          <div className="flex justify-center items-end p-6 bg-gradient-to-b from-primary-50 to-transparent">
            {/* Render Top 3 Users */}
            {topThreeUsers.length >= 2 && (
              <div className="flex flex-col items-center mx-4"> {/* 2nd Place */}
                <div className="relative">
                  <div className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs z-10">2</div>
                  <div className="w-16 h-16 rounded-full border-2 border-accent bg-gray-300 flex items-center justify-center overflow-hidden">
                    {topThreeUsers[1]?.profileImage ? (
                      <img 
                        src={topThreeUsers[1].profileImage} 
                        alt="Second place user" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="material-icons text-white text-2xl">person</span>
                    )}
                  </div>
                </div>
                <p className="font-accent text-sm mt-2 font-medium">@{topThreeUsers[1]?.username}</p>
                <p className="text-xs text-primary font-medium">{topThreeUsers[1]?.points} pts</p>
              </div>
            )}
            
            {topThreeUsers.length >= 1 && (
              <div className="flex flex-col items-center mx-4"> {/* 1st Place */}
                <div className="relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-accent">
                    <span className="material-icons text-3xl">emoji_events</span>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs z-10">1</div>
                  <div className="w-20 h-20 rounded-full border-2 border-accent bg-gray-300 flex items-center justify-center overflow-hidden">
                    {topThreeUsers[0]?.profileImage ? (
                      <img 
                        src={topThreeUsers[0].profileImage} 
                        alt="First place user" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="material-icons text-white text-2xl">person</span>
                    )}
                  </div>
                </div>
                <p className="font-accent text-sm mt-2 font-medium">@{topThreeUsers[0]?.username}</p>
                <p className="text-xs text-primary font-medium">{topThreeUsers[0]?.points} pts</p>
              </div>
            )}
            
            {topThreeUsers.length >= 3 && (
              <div className="flex flex-col items-center mx-4"> {/* 3rd Place */}
                <div className="relative">
                  <div className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs z-10">3</div>
                  <div className="w-16 h-16 rounded-full border-2 border-accent bg-gray-300 flex items-center justify-center overflow-hidden">
                    {topThreeUsers[2]?.profileImage ? (
                      <img 
                        src={topThreeUsers[2].profileImage} 
                        alt="Third place user" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="material-icons text-white text-2xl">person</span>
                    )}
                  </div>
                </div>
                <p className="font-accent text-sm mt-2 font-medium">@{topThreeUsers[2]?.username}</p>
                <p className="text-xs text-primary font-medium">{topThreeUsers[2]?.points} pts</p>
              </div>
            )}
          </div>
          
          {/* Leaderboard List */}
          <div className="bg-white rounded-t-xl -mt-4 shadow-md p-4">
            <h3 className="font-heading font-bold text-lg mb-3">Top Contributors</h3>
            
            {remainingUsers.map((user, index) => (
              <div key={user.id} className="flex items-center py-3 border-b border-neutral-light">
                <div className="w-6 text-center font-bold text-neutral-medium">{index + 4}</div>
                <div className="w-10 h-10 rounded-full mx-3 bg-gray-300 flex items-center justify-center overflow-hidden">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt="User avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="material-icons text-white">person</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">@{user.username}</p>
                  <div className="flex items-center">
                    <span className="text-xs bg-primary-50 text-primary px-1 rounded">Sustainability Hero</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-accent font-medium">{user.points} pts</p>
                </div>
              </div>
            ))}
            
            {remainingUsers.length === 0 && !isLoading && (
              <div className="py-6 text-center text-neutral-medium">
                No other contributors yet
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
