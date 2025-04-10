import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import useVideoRecorder from "@/hooks/use-video-recorder";

// Topic options
const topics = [
  { id: "energy", icon: "bolt", label: "Energy" },
  { id: "waste", icon: "delete", label: "Waste" },
  { id: "biodiversity", icon: "park", label: "Biodiversity" },
  { id: "conservation", icon: "eco", label: "Conservation" },
  { id: "climate", icon: "ac_unit", label: "Climate" },
];

export default function Record() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [selectedTopic, setSelectedTopic] = useState(topics[0].id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recordingStep, setRecordingStep] = useState<"recording" | "preview" | "metadata">("recording");
  
  const {
    videoBlob,
    isRecording,
    recordedTime,
    startRecording,
    stopRecording,
    resetRecording,
    videoRef,
    streamRef
  } = useVideoRecorder(60);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
  };

  const handleStopRecording = () => {
    stopRecording();
    setRecordingStep("preview");
  };

  const handleCancel = () => {
    navigate("/");
  };

  const handleRetake = () => {
    resetRecording();
    setRecordingStep("recording");
  };

  const handleContinue = () => {
    setRecordingStep("metadata");
  };

  const handleSubmit = async () => {
    if (!videoBlob || !title) {
      toast({
        title: "Error",
        description: "Video and title are required",
        variant: "destructive"
      });
      return;
    }

    try {
      // For now, hardcode user ID as 1 since we don't have auth
      const userId = 1;
      
      const formData = new FormData();
      formData.append("video", videoBlob, "recording.webm");
      formData.append("userId", userId.toString());
      formData.append("title", title);
      formData.append("description", description);
      formData.append("topic", selectedTopic);
      
      await fetch("/api/videos", {
        method: "POST",
        body: formData,
      });
      
      toast({
        title: "Success!",
        description: "Your sustainability story has been submitted for review",
      });
      
      // Invalidate videos query to refresh the feed
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload video",
        variant: "destructive"
      });
    }
  };

  // Formats time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Auto-start recording when component mounts
  useEffect(() => {
    if (recordingStep === "recording" && !isRecording) {
      startRecording();
    }
  }, [recordingStep, isRecording, startRecording]);

  return (
    <div className="fixed inset-0 bg-black z-20">
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between">
          <button className="text-white" onClick={handleCancel}>
            <span className="material-icons">close</span>
          </button>
          <div className="flex items-center">
            {recordingStep === "recording" && (
              <>
                <button className="text-white mr-3">
                  <span className="material-icons">flash_off</span>
                </button>
                <button className="text-white mr-3">
                  <span className="material-icons">flip_camera_ios</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 relative">
          {/* Camera/Video Preview */}
          <div className="absolute inset-0">
            {recordingStep === "recording" ? (
              <video 
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            ) : (
              <video 
                className="w-full h-full object-cover"
                src={videoBlob ? URL.createObjectURL(videoBlob) : undefined}
                autoPlay
                playsInline
                controls={recordingStep === "preview"}
              />
            )}
          </div>

          {/* UI Overlays */}
          {recordingStep === "recording" && (
            <>
              {/* Timer */}
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-center">
                <div className="bg-black/40 text-white px-4 py-2 rounded-full flex items-center recording-timer">
                  <span className="material-icons text-red-500 animate-pulse mr-2">fiber_manual_record</span>
                  <span className="font-mono">{formatTime(recordedTime)}</span>
                  <span className="text-xs ml-2">/ 01:00</span>
                </div>
              </div>

              {/* Topic Selector */}
              <div className="absolute top-1/3 right-4 flex flex-col space-y-3">
                {topics.map((topic) => (
                  <button 
                    key={topic.id}
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${
                      selectedTopic === topic.id ? "bg-green-700" : "bg-black/30"
                    }`}
                    onClick={() => handleTopicSelect(topic.id)}
                  >
                    <span className="material-icons text-sm">{topic.icon}</span>
                  </button>
                ))}
              </div>

              {/* Recording Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center">
                <div className="flex items-center justify-center space-x-8 mb-6">
                  <button className="h-16 w-16 rounded-full border-4 border-white flex items-center justify-center bg-red-500"
                    onClick={handleStopRecording}
                  >
                    <span className="material-icons text-white text-3xl">stop</span>
                  </button>
                </div>
                <p className="text-white text-sm opacity-80 text-center max-w-xs">
                  Share your sustainability story in 60 seconds or less
                </p>
              </div>
            </>
          )}

          {/* Preview Controls */}
          {recordingStep === "preview" && (
            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center">
              <div className="flex items-center justify-center space-x-4 mb-6 w-full">
                <button 
                  className="py-2 px-4 bg-white/20 text-white rounded-full"
                  onClick={handleRetake}
                >
                  Retake
                </button>
                <button 
                  className="py-2 px-6 bg-green-700 text-white rounded-full flex-1"
                  onClick={handleContinue}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Metadata Form */}
          {recordingStep === "metadata" && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-6">
              <h3 className="text-white text-lg font-bold mb-4">Add Details</h3>
              
              <div className="mb-4">
                <label className="block text-white text-sm mb-1">Topic</label>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                        selectedTopic === topic.id 
                          ? "bg-green-700 text-white" 
                          : "bg-white/20 text-white"
                      }`}
                      onClick={() => setSelectedTopic(topic.id)}
                    >
                      <span className="material-icons text-sm">{topic.icon}</span>
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-white text-sm mb-1">Title (required)</label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded p-2 text-white"
                  placeholder="Give your video a title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={60}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-white text-sm mb-1">Description</label>
                <textarea
                  className="w-full bg-white/10 border border-white/20 rounded p-2 text-white"
                  placeholder="Add a short description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  maxLength={150}
                />
              </div>
              
              <div className="flex space-x-3">
                <button 
                  className="flex-1 py-2 bg-white/20 text-white rounded-lg"
                  onClick={handleRetake}
                >
                  Retake
                </button>
                <button 
                  className="flex-1 py-2 bg-green-700 text-white rounded-lg font-medium"
                  onClick={handleSubmit}
                  disabled={!title}
                >
                  Upload
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
