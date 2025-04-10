import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Video } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type AdminTab = "pending" | "reported" | "featured" | "challenges";

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("pending");
  const { toast } = useToast();
  
  // Fetch pending videos
  const { data: pendingVideos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/admin/pending-videos"],
  });
  
  // Mutation for reviewing videos
  const reviewMutation = useMutation({
    mutationFn: async ({ videoId, status }: { videoId: number, status: string }) => {
      return apiRequest("POST", `/api/admin/videos/${videoId}/review`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-videos"] });
      toast({
        title: "Success",
        description: "Video review submitted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to review video: " + error,
        variant: "destructive",
      });
    }
  });
  
  const handleApprove = (videoId: number) => {
    reviewMutation.mutate({ videoId, status: "approved" });
  };
  
  const handleReject = (videoId: number) => {
    reviewMutation.mutate({ videoId, status: "rejected" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-lightest pb-8">
      {/* Admin Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <span className="material-icons text-primary mr-2">admin_panel_settings</span>
            <h1 className="font-heading font-bold text-xl text-primary">Admin Dashboard</h1>
          </div>
          <button className="text-neutral-medium p-2">
            <span className="material-icons">logout</span>
          </button>
        </div>
      </header>
      
      {/* Admin Stats */}
      <div className="bg-white p-4 grid grid-cols-2 gap-4">
        <div className="bg-primary-50 p-3 rounded-lg">
          <p className="text-neutral-medium text-sm">Videos Today</p>
          <p className="text-2xl font-heading font-bold">{pendingVideos?.length || 0}</p>
          <p className="text-xs text-green-600">New submissions</p>
        </div>
        <div className="bg-primary-50 p-3 rounded-lg">
          <p className="text-neutral-medium text-sm">Active Users</p>
          <p className="text-2xl font-heading font-bold">0</p>
          <p className="text-xs text-neutral-medium">No stats available</p>
        </div>
        <div className="bg-primary-50 p-3 rounded-lg">
          <p className="text-neutral-medium text-sm">Pending Reviews</p>
          <p className="text-2xl font-heading font-bold">{pendingVideos?.length || 0}</p>
          <p className="text-xs text-status-error">{pendingVideos?.length ? "+1 since last check" : "No pending reviews"}</p>
        </div>
        <div className="bg-primary-50 p-3 rounded-lg">
          <p className="text-neutral-medium text-sm">Challenge Entries</p>
          <p className="text-2xl font-heading font-bold">0</p>
          <p className="text-xs text-neutral-medium">No active challenges</p>
        </div>
      </div>
      
      {/* Admin Tabs */}
      <div className="bg-white border-b border-neutral-light px-4 py-2 mt-2">
        <div className="flex space-x-2 overflow-x-auto">
          <button 
            className={`px-4 py-2 rounded-lg font-accent ${activeTab === "pending" ? "bg-primary text-white" : "bg-neutral-lightest text-neutral-dark"}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-accent ${activeTab === "reported" ? "bg-primary text-white" : "bg-neutral-lightest text-neutral-dark"}`}
            onClick={() => setActiveTab("reported")}
          >
            Reported
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-accent ${activeTab === "featured" ? "bg-primary text-white" : "bg-neutral-lightest text-neutral-dark"}`}
            onClick={() => setActiveTab("featured")}
          >
            Featured
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-accent ${activeTab === "challenges" ? "bg-primary text-white" : "bg-neutral-lightest text-neutral-dark"}`}
            onClick={() => setActiveTab("challenges")}
          >
            Challenges
          </button>
        </div>
      </div>
      
      {/* Admin Content */}
      <div className="bg-white mt-2 p-4">
        {activeTab === "pending" && (
          <>
            <h3 className="font-heading font-semibold text-lg mb-4">Content Pending Review</h3>
            
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pendingVideos && pendingVideos.length > 0 ? (
              <>
                {pendingVideos.map(video => (
                  <div key={video.id} className="border border-neutral-light rounded-lg mb-4 overflow-hidden">
                    <div className="flex">
                      <div className="w-28 h-28 bg-gray-200"></div>
                      <div className="p-3 flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{video.title}</h4>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{video.topic}</span>
                        </div>
                        <p className="text-sm text-neutral-medium mt-1">
                          User ID: {video.userId} • {new Date(video.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm mt-2 line-clamp-2">{video.description || "No description"}</p>
                        <div className="flex mt-3 space-x-2">
                          <button 
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg flex items-center"
                            onClick={() => handleApprove(video.id)}
                            disabled={reviewMutation.isPending}
                          >
                            <span className="material-icons text-sm mr-1">check</span> Approve
                          </button>
                          <button 
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg flex items-center"
                            onClick={() => handleReject(video.id)}
                            disabled={reviewMutation.isPending}
                          >
                            <span className="material-icons text-sm mr-1">close</span> Reject
                          </button>
                          <button className="px-3 py-1 bg-neutral-light text-neutral-dark text-sm rounded-lg ml-auto">
                            Preview
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="py-8 text-center text-neutral-medium">
                No videos pending review
              </div>
            )}
          </>
        )}
        
        {activeTab === "reported" && (
          <div className="py-8 text-center text-neutral-medium">
            No reported content to review
          </div>
        )}
        
        {activeTab === "featured" && (
          <div className="py-8 text-center text-neutral-medium">
            No featured content to manage
          </div>
        )}
        
        {activeTab === "challenges" && (
          <div className="py-8 text-center text-neutral-medium">
            No challenges to manage
          </div>
        )}
      </div>
    </div>
  );
}
