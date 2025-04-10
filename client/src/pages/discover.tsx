import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Video } from "@shared/schema";
import AppHeader from "@/components/app-header";
import VideoCard from "@/components/video-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function Discover() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Fetch all approved videos
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
    queryFn: async () => {
      const response = await fetch(`/api/videos?limit=50`);
      if (!response.ok) throw new Error("Failed to fetch videos");
      return response.json();
    },
  });

  // Filter videos when search term, selected topic, or videos data changes
  useEffect(() => {
    if (!videos) return;

    let result = [...videos];

    // Filter by topic if not "all"
    if (selectedTopic !== "all") {
      result = result.filter(video => video.topic === selectedTopic);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        video => 
          video.title.toLowerCase().includes(term) || 
          (video.description && video.description.toLowerCase().includes(term))
      );
    }

    setFilteredVideos(result);
  }, [videos, searchTerm, selectedTopic]);

  // Topics array with icons
  const topics = [
    { id: "all", label: "All", icon: "apps" },
    { id: "energy", label: "Energy", icon: "bolt" },
    { id: "waste", label: "Waste", icon: "delete" },
    { id: "biodiversity", label: "Biodiversity", icon: "eco" },
    { id: "climate", label: "Climate", icon: "thermostat" },
    { id: "food", label: "Food", icon: "restaurant" },
    { id: "fashion", label: "Fashion", icon: "checkroom" },
    { id: "water", label: "Water", icon: "water_drop" },
    { id: "technology", label: "Technology", icon: "devices" },
    { id: "building", label: "Building", icon: "apartment" },
    { id: "transportation", label: "Transportation", icon: "directions_car" },
    { id: "urban", label: "Urban", icon: "location_city" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="Discover" icon="explore" />
      
      <div className="p-4">
        <div className="mb-4">
          <Input
            placeholder="Search videos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full"
            icon="search"
          />
        </div>

        {/* Topics filter */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Topics</h3>
          <div className="overflow-x-auto pb-2">
            <div className="flex space-x-2">
              {topics.map(topic => (
                <div
                  key={topic.id}
                  className={`flex flex-col items-center cursor-pointer p-2 rounded transition-colors ${
                    selectedTopic === topic.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedTopic(topic.id)}
                >
                  <span className="material-icons text-xl mb-1">{topic.icon}</span>
                  <span className="text-xs">{topic.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Video grid */}
        <div className={`${isMobile ? '' : 'grid grid-cols-2 gap-4'}`}>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading videos...</p>
            </div>
          ) : filteredVideos.length > 0 ? (
            filteredVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))
          ) : (
            <div className="text-center py-8">
              <span className="material-icons text-4xl text-gray-400">videocam_off</span>
              <p className="mt-2 text-gray-500">No videos found</p>
              {searchTerm && (
                <p className="text-sm text-gray-400">
                  Try a different search term or topic filter
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}