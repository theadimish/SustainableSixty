import { useState } from "react";
import { Link } from "wouter";
import { Video, User, Comment } from "@shared/schema";
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
  
  // Like video mutation - works as toggle now
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        throw new Error("You must be logged in to like videos");
      }
      return apiRequest("POST", `/api/videos/${video.id}/like`, { 
        action: hasLiked ? 'unlike' : 'like' 
      });
    },
    onSuccess: () => {
      setHasLiked(!hasLiked);
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    }
  });
  
  // Save video mutation
  const [isSaved, setIsSaved] = useState(false);
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        throw new Error("You must be logged in to save videos");
      }
      return apiRequest("POST", `/api/videos/${video.id}/save`, { 
        action: isSaved ? 'unsave' : 'save' 
      });
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      queryClient.invalidateQueries({ queryKey: ["/api/users/saved-videos"] });
    }
  });
  
  // Copy link function
  const [linkCopied, setLinkCopied] = useState(false);
  const copyVideoLink = () => {
    const videoUrl = `${window.location.origin}/videos/${video.id}`;
    navigator.clipboard.writeText(videoUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };
  
  // Comments popup
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { data: comments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: [`/api/videos/${video.id}/comments`],
    enabled: showComments,
  });
  
  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        throw new Error("You must be logged in to comment");
      }
      if (!commentText.trim()) {
        throw new Error("Comment cannot be empty");
      }
      return apiRequest("POST", "/api/comments", {
        videoId: video.id,
        userId: currentUser.id,
        content: commentText.trim(),
      });
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${video.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    }
  });
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    commentMutation.mutate();
  };
  
  const handleLike = () => {
    likeMutation.mutate();
  };
  
  const handleSaveVideo = () => {
    saveMutation.mutate();
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
    <>
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
            <button 
              className="flex items-center" 
              onClick={() => setShowComments(true)}
            >
              <span className="material-icons mr-1 text-xl">chat_bubble_outline</span>
              <span>{video.comments}</span>
            </button>
            <button className="flex items-center" onClick={copyVideoLink}>
              <span className="material-icons mr-1 text-xl">
                {linkCopied ? "check_circle" : "content_copy"}
              </span>
              <span>{linkCopied ? "Copied!" : "Copy Link"}</span>
            </button>
            <button 
              className="flex items-center"
              onClick={handleSaveVideo}
              disabled={!currentUser || saveMutation.isPending}
            >
              <span className={`material-icons mr-1 text-xl ${isSaved ? 'text-blue-500' : ''}`}>
                {isSaved ? "bookmark" : "bookmark_border"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments popup */}
      {showComments && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center md:items-center p-4">
          <div className="bg-white rounded-t-lg md:rounded-lg max-w-xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-heading font-semibold">Comments ({video.comments})</h3>
              <button 
                onClick={() => setShowComments(false)}
                className="p-1"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {commentsLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-xs font-medium">
                        {comment.userId.toString().substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="text-sm font-semibold">User #{comment.userId}</p>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="material-icons text-3xl mb-2">chat_bubble_outline</span>
                  <p>No comments yet</p>
                  <p className="text-sm">Be the first to comment</p>
                </div>
              )}
            </div>
            
            {currentUser ? (
              <div className="p-4 border-t">
                <form onSubmit={handleCommentSubmit} className="flex">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={commentMutation.isPending}
                  />
                  <button 
                    type="submit" 
                    className="bg-primary text-white px-4 rounded-r-lg font-medium"
                    disabled={!commentText.trim() || commentMutation.isPending}
                  >
                    {commentMutation.isPending ? (
                      <span className="material-icons animate-spin">sync</span>
                    ) : (
                      "Post"
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-4 border-t text-center">
                <p className="text-sm text-gray-600 mb-2">Login to post comments</p>
                <button 
                  onClick={() => window.location.href = "/auth"}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium"
                >
                  Sign In or Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
