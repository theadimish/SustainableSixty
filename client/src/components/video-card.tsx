import { useState } from "react";
import { Link } from "wouter";
import { Video, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const { user: currentUser } = useAuth();
  
  // Format time since video was posted
  const timeAgo = formatDistanceToNow(new Date(video.createdAt), { addSuffix: true });
  
  // Fetch video creator
  const { data: creator } = useQuery<User>({
    queryKey: [`/api/users/${video.userId}`],
    enabled: !!video.userId,
  });
  
  // Like video mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        throw new Error("You must be logged in to like videos");
      }
      return apiRequest("POST", `/api/videos/${video.id}/like`, {});
    },
    onSuccess: () => {
      setHasLiked(true);
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    }
  });
  
  const handleLike = () => {
    if (!hasLiked) {
      likeMutation.mutate();
    }
  };
  
  const handlePlayPause = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
        // Track view only once per component mount
        if (!hasViewed) {
          setHasViewed(true);
          apiRequest("POST", `/api/videos/${video.id}/view`, {})
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
            });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  return (
    <div className="video-card bg-white mb-4 rounded-lg shadow overflow-hidden">
      <div className="relative">
        <div className="aspect-[9/16] bg-neutral-dark relative">
          {video.videoUrl ? (
            <video
              ref={setVideoRef}
              src={video.videoUrl}
              className={`w-full h-full object-cover ${isPlaying ? 'block' : 'hidden'}`}
              poster={video.thumbnailUrl || undefined}
              playsInline
              muted
              onEnded={() => setIsPlaying(false)}
            />
          ) : null}
          
          {video.thumbnailUrl ? (
            <img 
              src={video.thumbnailUrl} 
              alt={`Thumbnail for ${video.title}`} 
              className={`w-full h-full object-cover ${isPlaying ? 'hidden' : 'block'}`}
            />
          ) : (
            <div className={`w-full h-full bg-neutral-dark flex items-center justify-center ${isPlaying ? 'hidden' : 'block'}`}>
              <span className="material-icons text-white text-4xl opacity-50">videocam</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
          {isPlaying && <div className="video-progress w-0"></div>}
          <button 
            className="absolute inset-0 w-full h-full flex items-center justify-center"
            onClick={handlePlayPause}
          >
            <span className="material-icons text-white text-5xl opacity-80">
              {isPlaying ? "pause_circle" : "play_circle"}
            </span>
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <div className="flex items-start">
            <div 
              onClick={() => window.location.href = `/profile/${video.userId}`}
              className="cursor-pointer"
            >
              {creator?.profileImage ? (
                <img 
                  src={creator.profileImage} 
                  alt={creator.displayName} 
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center">
                  <span className="material-icons text-white">person</span>
                </div>
              )}
            </div>
            <div className="ml-2 flex-1">
              <h3 className="font-heading font-semibold">{video.title}</h3>
              <p className="text-sm opacity-90">
                {creator ? `@${creator.username}` : 'Loading...'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center text-sm text-neutral-medium mb-2">
          <span className="bg-primary-50 text-primary px-2 py-1 rounded-full text-xs font-accent">
            {video.topic.charAt(0).toUpperCase() + video.topic.slice(1)}
          </span>
          <span className="ml-auto text-xs">{timeAgo}</span>
        </div>
        <p className="text-sm mb-3">{video.description || "No description provided."}</p>
        <div className="flex items-center justify-between text-neutral-medium">
          <button 
            className="flex items-center" 
            onClick={handleLike}
            disabled={!currentUser || likeMutation.isPending}
          >
            <span className={`material-icons mr-1 text-xl ${hasLiked ? 'text-red-500' : ''}`}>
              {hasLiked ? "favorite" : "favorite_border"}
            </span>
            <span>{video.likes}</span>
          </button>
          <div 
            onClick={() => window.location.href = `/videos/${video.id}`}
            className="flex items-center cursor-pointer"
          >
            <span className="material-icons mr-1 text-xl">chat_bubble_outline</span>
            <span>{video.comments}</span>
          </div>
          <button className="flex items-center">
            <span className="material-icons mr-1 text-xl">share</span>
            <span>{video.shares}</span>
          </button>
          <button className="flex items-center">
            <span className="material-icons mr-1 text-xl">bookmark_border</span>
          </button>
        </div>
      </div>
    </div>
  );
}
