import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Video } from "@shared/schema";
import AppHeader from "@/components/app-header";
import TopicFilters from "@/components/topic-filters";
import WeeklyChallenge from "@/components/weekly-challenge";
import VideoCard from "@/components/video-card";
import { Challenge } from "@shared/schema";

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [page, setPage] = useState(0);
  const limit = 5;

  // Fetch videos based on selected topic
  const { data: videos, isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: [selectedTopic === "all" ? "/api/videos" : `/api/videos?topic=${selectedTopic}`, page],
    queryFn: async ({ queryKey }) => {
      const offset = page * limit;
      const url = `${queryKey[0]}&limit=${limit}&offset=${offset}`;
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
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-lightest">
      <AppHeader title="EcoSnap" />
      <TopicFilters selectedTopic={selectedTopic} onSelectTopic={setSelectedTopic} />
      
      <div className="flex-1 pb-16" onScroll={handleScroll}>
        {!challengeLoading && challenge && (
          <WeeklyChallenge challenge={challenge} />
        )}
        
        <div className="video-feed">
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
              <VideoCard key={video.id} video={video} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
