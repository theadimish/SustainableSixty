import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertVideoSchema, insertCommentSchema, insertChallengeSchema, insertAchievementSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { setupAuth } from "./auth";

// Setup storage for video uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage2 });

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Error creating user" });
      }
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user" });
    }
  });

  app.get("/api/users/username/:username", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user" });
    }
  });

  app.get("/api/leaderboard", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await storage.getTopUsers(limit);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving leaderboard" });
    }
  });

  // Video routes
  app.post("/api/videos", upload.single('video'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file uploaded" });
      }
      
      const videoUrl = `/uploads/${req.file.filename}`;
      const videoData = {
        ...req.body,
        videoUrl,
        userId: parseInt(req.body.userId)
      };
      
      const parsedData = insertVideoSchema.parse(videoData);
      const video = await storage.createVideo(parsedData);
      
      // Award points for uploading video
      await storage.updateUserPoints(parsedData.userId, 10);
      
      res.status(201).json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Error creating video" });
      }
    }
  });

  app.get("/api/videos", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const topic = req.query.topic as string;
      
      let videos;
      if (topic && topic !== "all") {
        videos = await storage.getVideosByTopic(topic, limit, offset);
      } else {
        videos = await storage.getApprovedVideos(limit, offset);
      }
      
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving videos" });
    }
  });

  app.get("/api/videos/:id", async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Increment view count
      await storage.updateVideoViews(videoId, 1);
      
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving video" });
    }
  });

  app.get("/api/users/:userId/videos", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const videos = await storage.getVideosByUserId(userId);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user videos" });
    }
  });

  app.post("/api/videos/:id/like", async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      const updatedVideo = await storage.updateVideoLikes(videoId, 1);
      
      // Award points to the video creator
      await storage.updateUserPoints(video.userId, 1);
      
      res.json(updatedVideo);
    } catch (error) {
      res.status(500).json({ message: "Error liking video" });
    }
  });
  
  app.post("/api/videos/:id/view", async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      const updatedVideo = await storage.updateVideoViews(videoId, 1);
      
      res.json(updatedVideo);
    } catch (error) {
      res.status(500).json({ message: "Error tracking video view" });
    }
  });
  
  // Save/unsave video route
  app.post("/api/videos/:id/save", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user.id;
      const videoId = parseInt(req.params.id);
      const action = req.body.action || 'save';
      
      const video = await storage.getVideo(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      if (action === 'save') {
        const isSaved = await storage.isVideoSavedByUser(userId, videoId);
        if (!isSaved) {
          await storage.saveVideo({ userId, videoId });
        }
      } else if (action === 'unsave') {
        await storage.unsaveVideo(userId, videoId);
      }
      
      res.json({ success: true, action });
    } catch (error) {
      res.status(500).json({ message: "Error saving/unsaving video" });
    }
  });
  
  // Get user's saved videos
  app.get("/api/users/saved-videos", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const videos = await storage.getSavedVideosByUserId(req.user.id);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving saved videos" });
    }
  });

  // Admin routes
  app.get("/api/admin/pending-videos", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const videos = await storage.getPendingVideos(limit);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving pending videos" });
    }
  });

  app.post("/api/admin/videos/:id/review", async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (status !== "approved" && status !== "rejected") {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const video = await storage.getVideo(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      const updatedVideo = await storage.updateVideoStatus(videoId, status);
      
      // If approved, give points to the creator
      if (status === "approved") {
        await storage.updateUserPoints(video.userId, 20);
      }
      
      res.json(updatedVideo);
    } catch (error) {
      res.status(500).json({ message: "Error reviewing video" });
    }
  });

  // Comment routes
  app.post("/api/comments", async (req: Request, res: Response) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(commentData);
      
      // Award points for commenting
      await storage.updateUserPoints(commentData.userId, 1);
      
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Error creating comment" });
      }
    }
  });

  app.get("/api/videos/:videoId/comments", async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.videoId);
      const comments = await storage.getCommentsByVideoId(videoId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving comments" });
    }
  });

  // Challenge routes
  app.post("/api/challenges", async (req: Request, res: Response) => {
    try {
      const challengeData = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createChallenge(challengeData);
      res.status(201).json(challenge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Error creating challenge" });
      }
    }
  });

  app.get("/api/challenges/active", async (req: Request, res: Response) => {
    try {
      const challenge = await storage.getActiveChallenge();
      if (!challenge) {
        return res.status(404).json({ message: "No active challenge found" });
      }
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving active challenge" });
    }
  });

  app.get("/api/challenges", async (req: Request, res: Response) => {
    try {
      const challenges = await storage.getAllChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving challenges" });
    }
  });

  // Achievement routes
  app.post("/api/achievements", async (req: Request, res: Response) => {
    try {
      const achievementData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(achievementData);
      res.status(201).json(achievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Error creating achievement" });
      }
    }
  });

  app.get("/api/users/:userId/achievements", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const achievements = await storage.getAchievementsByUserId(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving achievements" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  const httpServer = createServer(app);

  return httpServer;
}
