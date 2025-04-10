import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AppHeader from "@/components/app-header";
import { User, Video, Achievement } from "@shared/schema";

// Achievement icons and labels
const achievementTypes = {
  "green_beginner": { icon: "eco", label: "Green Beginner" },
  "energy_saver": { icon: "bolt", label: "Energy Saver" },
  "waste_warrior": { icon: "delete", label: "Waste Warrior" },
  "biodiversity_pro": { icon: "park", label: "Biodiversity Pro" },
  "top_creator": { icon: "workspace_premium", label: "Top Creator" },
};

type TabType = "videos" | "saved";

export default function Profile() {
  const params = useParams();
  // If no ID provided, default to user 1 (would be current user in real app)
  const userId = params.id ? parseInt(params.id) : 1;
  
  const [activeTab, setActiveTab] = useState<TabType>("videos");
  
  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });
  
  // Fetch user videos
  const { data: videos, isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: [`/api/users/${userId}/videos`],
    enabled: !!userId,
  });
  
  // Fetch saved videos
  const { data: savedVideos, isLoading: savedVideosLoading } = useQuery<Video[]>({
    queryKey: ["/api/users/saved-videos"],
    enabled: activeTab === "saved" && !!userId,
  });
  
  // Fetch user achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: [`/api/users/${userId}/achievements`],
    enabled: !!userId,
  });
  
  // Determine which achievements the user has
  const earnedAchievements = new Set(achievements?.map(a => a.type) || []);
  
  if (userLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center p-4">
          <h2 className="text-xl font-bold text-neutral-dark mb-2">User Not Found</h2>
          <p className="text-neutral-medium">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-lightest">
      {/* Profile Header */}
      <header className="bg-white">
        <div className="relative h-32 bg-primary-50">
          <div className="absolute top-4 right-4 flex space-x-2">
            <button className="p-2 bg-black/20 rounded-full text-white">
              <span className="material-icons">settings</span>
            </button>
            <button className="p-2 bg-black/20 rounded-full text-white">
              <span className="material-icons">share</span>
            </button>
          </div>
        </div>
        <div className="px-4 pb-4 relative">
          <div className="absolute -top-12 left-4 rounded-full border-4 border-white overflow-hidden bg-gray-300 w-24 h-24 flex items-center justify-center">
            {user.profileImage ? (
              <img 
                src={user.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="material-icons text-white text-4xl">person</span>
            )}
          </div>
          <div className="ml-28 pt-1">
            <h2 className="font-heading font-bold text-xl">{user.displayName || user.username}</h2>
            <p className="text-neutral-medium">@{user.username}</p>
          </div>
          <div className="flex mt-4">
            <div className="flex-1 text-center">
              <p className="font-heading font-bold">{videos?.length || 0}</p>
              <p className="text-sm text-neutral-medium">Videos</p>
            </div>
            <div className="flex-1 text-center border-l border-r border-neutral-light">
              <p className="font-heading font-bold">0</p>
              <p className="text-sm text-neutral-medium">Followers</p>
            </div>
            <div className="flex-1 text-center">
              <p className="font-heading font-bold">{user.points}</p>
              <p className="text-sm text-neutral-medium">Points</p>
            </div>
          </div>
          <p className="text-sm mt-4">{user.bio || "Passionate about sustainable living 🌎"}</p>
          <button className="mt-4 w-full py-2 rounded-lg border border-primary text-primary font-accent">
            Edit Profile
          </button>
        </div>
      </header>

      {/* Achievements */}
      <div className="bg-white mt-2 p-4">
        <h3 className="font-heading font-semibold mb-3">Achievements</h3>
        <div className="flex overflow-x-auto pb-2 space-x-4">
          {Object.entries(achievementTypes).map(([type, { icon, label }]) => {
            const isEarned = earnedAchievements.has(type);
            return (
              <div key={type} className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isEarned ? "bg-primary-50" : "bg-neutral-light"
                }`}>
                  <span className={`material-icons text-2xl ${
                    isEarned ? "text-primary" : "text-neutral-medium"
                  }`}>
                    {icon}
                  </span>
                </div>
                <p className={`text-xs text-center mt-1 ${
                  isEarned ? "" : "text-neutral-medium"
                }`}>
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mt-2 bg-white flex-1">
        <div className="border-b border-neutral-light">
          <div className="flex">
            <button 
              className={`flex-1 py-3 font-accent ${
                activeTab === "videos" 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-neutral-medium"
              }`}
              onClick={() => setActiveTab("videos")}
            >
              My Videos
            </button>
            <button 
              className={`flex-1 py-3 font-accent ${
                activeTab === "saved" 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-neutral-medium"
              }`}
              onClick={() => setActiveTab("saved")}
            >
              Saved
            </button>
          </div>
        </div>
        
        {activeTab === "videos" && (
          <>
            {videosLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : videos && videos.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 p-1">
                {videos.map((video) => (
                  <div key={video.id} className="aspect-square relative">
                    <div className="w-full h-full bg-gray-200"></div>
                    <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
                      <span className="material-icons text-xs">visibility</span> {video.views}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-neutral-medium">
                No videos yet
              </div>
            )}
          </>
        )}
        
        {activeTab === "saved" && (
          <>
            {savedVideosLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : savedVideos && savedVideos.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 p-1">
                {savedVideos.map((video) => (
                  <div 
                    key={video.id} 
                    className="aspect-square relative cursor-pointer"
                    onClick={() => window.location.href = `/videos/${video.id}`}
                  >
                    {video.thumbnailUrl ? (
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="material-icons text-gray-400">videocam</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
                    <div className="absolute bottom-1 left-1 right-1 text-white text-xs p-1">
                      <p className="font-semibold truncate">{video.title}</p>
                    </div>
                    <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
                      <span className="material-icons text-xs">visibility</span> {video.views}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-neutral-medium">
                <span className="material-icons text-4xl mb-2">bookmark_border</span>
                <p>No saved videos yet</p>
                <p className="text-sm mt-2">Videos you save will appear here</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
