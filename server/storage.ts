import { 
  users, type User, type InsertUser,
  videos, type Video, type InsertVideo,
  comments, type Comment, type InsertComment,
  challenges, type Challenge, type InsertChallenge,
  achievements, type Achievement, type InsertAchievement
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User | undefined>;
  getTopUsers(limit: number): Promise<User[]>;
  
  // Video operations
  createVideo(video: InsertVideo): Promise<Video>;
  getVideo(id: number): Promise<Video | undefined>;
  getVideosByUserId(userId: number): Promise<Video[]>;
  getApprovedVideos(limit: number, offset: number): Promise<Video[]>;
  getVideosByTopic(topic: string, limit: number, offset: number): Promise<Video[]>;
  getPendingVideos(limit: number): Promise<Video[]>;
  updateVideoStatus(id: number, status: string): Promise<Video | undefined>;
  updateVideoLikes(id: number, count: number): Promise<Video | undefined>;
  updateVideoViews(id: number, count: number): Promise<Video | undefined>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByVideoId(videoId: number): Promise<Comment[]>;
  
  // Challenge operations
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getActiveChallenge(): Promise<Challenge | undefined>;
  getAllChallenges(): Promise<Challenge[]>;
  
  // Achievement operations
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getAchievementsByUserId(userId: number): Promise<Achievement[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<number, Video>;
  private comments: Map<number, Comment>;
  private challenges: Map<number, Challenge>;
  private achievements: Map<number, Achievement>;
  private userId: number;
  private videoId: number;
  private commentId: number;
  private challengeId: number;
  private achievementId: number;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.comments = new Map();
    this.challenges = new Map();
    this.achievements = new Map();
    this.userId = 1;
    this.videoId = 1;
    this.commentId = 1;
    this.challengeId = 1;
    this.achievementId = 1;
    
    // Add a sample challenge
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    this.createChallenge({
      title: "Weekly Challenge 🌟",
      description: "Show us your plastic-free grocery haul!",
      startDate: now,
      endDate: nextWeek,
      topic: "waste",
      isActive: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id, 
      points: 0, 
      role: "user",
      // Ensure bio and profileImage are not undefined
      bio: insertUser.bio ?? null,
      profileImage: insertUser.profileImage ?? null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserPoints(userId: number, points: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser = { ...user, points: user.points + points };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return undefined;
  }
  
  async getTopUsers(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);
  }

  // Video operations
  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.videoId++;
    const now = new Date();
    const video: Video = { 
      ...insertVideo, 
      id, 
      likes: 0, 
      views: 0, 
      comments: 0, 
      shares: 0, 
      status: "pending",
      createdAt: now,
      // Ensure description and thumbnailUrl are not undefined
      description: insertVideo.description ?? null,
      thumbnailUrl: insertVideo.thumbnailUrl ?? null
    };
    this.videos.set(id, video);
    return video;
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getVideosByUserId(userId: number): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.userId === userId
    );
  }

  async getApprovedVideos(limit: number, offset: number): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter((video) => video.status === "approved")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  async getVideosByTopic(topic: string, limit: number, offset: number): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter((video) => video.status === "approved" && video.topic === topic)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  async getPendingVideos(limit: number): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter((video) => video.status === "pending")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async updateVideoStatus(id: number, status: string): Promise<Video | undefined> {
    const video = await this.getVideo(id);
    if (video) {
      const updatedVideo = { ...video, status };
      this.videos.set(id, updatedVideo);
      return updatedVideo;
    }
    return undefined;
  }

  async updateVideoLikes(id: number, count: number): Promise<Video | undefined> {
    const video = await this.getVideo(id);
    if (video) {
      const updatedVideo = { ...video, likes: video.likes + count };
      this.videos.set(id, updatedVideo);
      return updatedVideo;
    }
    return undefined;
  }

  async updateVideoViews(id: number, count: number): Promise<Video | undefined> {
    const video = await this.getVideo(id);
    if (video) {
      const updatedVideo = { ...video, views: video.views + count };
      this.videos.set(id, updatedVideo);
      return updatedVideo;
    }
    return undefined;
  }

  // Comment operations
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const now = new Date();
    const comment: Comment = { ...insertComment, id, createdAt: now };
    this.comments.set(id, comment);
    
    // Update video comment count
    const video = await this.getVideo(insertComment.videoId);
    if (video) {
      const updatedVideo = { ...video, comments: video.comments + 1 };
      this.videos.set(video.id, updatedVideo);
    }
    
    return comment;
  }

  async getCommentsByVideoId(videoId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.videoId === videoId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Challenge operations
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.challengeId++;
    const challenge: Challenge = { ...insertChallenge, id };
    this.challenges.set(id, challenge);
    return challenge;
  }

  async getActiveChallenge(): Promise<Challenge | undefined> {
    const now = new Date();
    return Array.from(this.challenges.values()).find(
      (challenge) => 
        challenge.isActive && 
        new Date(challenge.startDate) <= now && 
        new Date(challenge.endDate) >= now
    );
  }

  async getAllChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values());
  }

  // Achievement operations
  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.achievementId++;
    const now = new Date();
    const achievement: Achievement = { ...insertAchievement, id, earnedAt: now };
    this.achievements.set(id, achievement);
    return achievement;
  }

  async getAchievementsByUserId(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(
      (achievement) => achievement.userId === userId
    );
  }
}

export const storage = new MemStorage();
