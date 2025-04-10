import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Video } from "@shared/schema";
import TopicFilters from "@/components/topic-filters";
import WeeklyChallenge from "@/components/weekly-challenge";
import VideoCard from "@/components/video-card";
import { Challenge } from "@shared/schema";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [page, setPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const limit = 5;
  const isTablet = useMediaQuery("(min-width: 768px)");

  // Fetch videos based on selected topic
  const { data: videos, isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: [selectedTopic === "all" ? "/api/videos" : `/api/videos?topic=${selectedTopic}`, page],
    queryFn: async ({ queryKey }) => {
      const offset = page * limit;
      const baseUrl = queryKey[0] as string;
      // Check if URL already has query parameters to determine if we need ? or &
      const separator = baseUrl.includes('?') ? '&' : '?';
      const url = `${baseUrl}${separator}limit=${limit}&offset=${offset}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch videos");
      return response.json();
    },
  });

  // Fetch active challenge
  const { data: challenge, isLoading: challengeLoading } = useQuery<Challenge>({
    queryKey: ["/api/challenges/active"],
  });

  // Handle infinite scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, clientHeight, scrollHeight } = scrollContainerRef.current;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      setPage((prev) => prev + 1);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b bg-white">
        <h1 className="text-2xl font-bold text-primary">EcoSnap</h1>
        <p className="text-sm text-gray-500">Sustainability in 60 seconds</p>
      </div>
      
      <div className="p-4">
        <TopicFilters selectedTopic={selectedTopic} onSelectTopic={setSelectedTopic} />
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pb-20 px-4"
      >
        {!challengeLoading && challenge && (
          <WeeklyChallenge challenge={challenge} />
        )}
        
        <div className={isTablet ? "grid grid-cols-2 gap-4" : ""}>
          {videosLoading && page === 0 ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white mb-4 rounded-lg shadow overflow-hidden animate-pulse">
                <div className="aspect-[9/16] bg-gray-200"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                </div>
              </div>
            ))
          ) : (
            videos?.map((video) => (
              <div key={video.id} className="mb-4">
                <VideoCard video={video} />
              </div>
            ))
          )}
          
          {videos && videos.length === 0 && !videosLoading && (
            <div className="text-center py-10">
              <div className="text-4xl text-gray-300 mb-2">😢</div>
              <p className="text-gray-500">No videos found for this topic</p>
              <p className="text-sm text-gray-400">Try selecting a different topic</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
