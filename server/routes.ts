import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertProxySchema, insertAccountListSchema, insertCheckResultSchema, insertActivitySchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { proxyScraper } from "./services/proxy-scraper";
import { accountChecker } from "./services/account-checker";
import { setupWebSocket } from "./websocket";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket
  const wss = new WebSocketServer({ server: httpServer });
  setupWebSocket(wss);

  // System Stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getLatestStats();
      const proxies = await storage.getAllProxies();
      const workingProxies = proxies.filter(p => p.isWorking);
      
      const updatedStats = await storage.updateStats({
        proxiesOnline: workingProxies.length,
        totalProxies: proxies.length,
      });
      
      res.json(updatedStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Proxies
  app.get("/api/proxies", async (req, res) => {
    try {
      const proxies = await storage.getAllProxies();
      res.json(proxies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proxies" });
    }
  });

  app.post("/api/proxies", async (req, res) => {
    try {
      const validatedData = insertProxySchema.parse(req.body);
      const proxy = await storage.createProxy(validatedData);
      res.json(proxy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid proxy data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create proxy" });
      }
    }
  });

  app.post("/api/proxies/scrape", async (req, res) => {
    try {
      const { sources } = req.body;
      const scrapedProxies = await proxyScraper.scrapeProxies(sources || ['freeproxylist', 'proxynova']);
      
      if (scrapedProxies.length > 0) {
        const savedProxies = await storage.bulkCreateProxies(scrapedProxies);
        await storage.addActivity({
          message: `Scraped ${savedProxies.length} new proxies`,
          type: 'success'
        });
        res.json({ count: savedProxies.length, proxies: savedProxies });
      } else {
        res.json({ count: 0, proxies: [] });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to scrape proxies" });
    }
  });

  app.post("/api/proxies/test", async (req, res) => {
    try {
      const proxies = await storage.getAllProxies();
      let testedCount = 0;
      
      for (const proxy of proxies) {
        const isWorking = await proxyScraper.testProxy(proxy);
        await storage.updateProxy(proxy.id, {
          isWorking,
          lastTested: new Date(),
          responseTime: isWorking ? Math.floor(Math.random() * 2000) + 500 : null,
        });
        testedCount++;
      }
      
      await storage.addActivity({
        message: `Tested ${testedCount} proxies`,
        type: 'info'
      });
      
      res.json({ testedCount });
    } catch (error) {
      res.status(500).json({ message: "Failed to test proxies" });
    }
  });

  app.delete("/api/proxies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProxy(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Proxy not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete proxy" });
    }
  });

  // Account Lists
  app.get("/api/account-lists", async (req, res) => {
    try {
      const lists = await storage.getAllAccountLists();
      res.json(lists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch account lists" });
    }
  });

  app.post("/api/account-lists", async (req, res) => {
    try {
      const validatedData = insertAccountListSchema.parse(req.body);
      const list = await storage.createAccountList(validatedData);
      res.json(list);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid account list data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create account list" });
      }
    }
  });

  app.post("/api/account-lists/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const content = req.file.buffer.toString('utf-8');
      const accounts = content.split('\n').filter(line => line.trim());
      const { name, platform } = req.body;

      const list = await storage.createAccountList({
        name: name || req.file.originalname,
        platform: platform || 'unknown',
        totalAccounts: accounts.length,
        accounts,
        status: 'pending',
        progress: 0,
        validAccounts: 0,
        invalidAccounts: 0,
      });

      await storage.addActivity({
        message: `Uploaded account list "${list.name}" with ${accounts.length} accounts`,
        type: 'success'
      });

      res.json(list);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload account list" });
    }
  });

  app.post("/api/account-lists/:id/check", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const list = await storage.getAccountList(id);
      
      if (!list) {
        return res.status(404).json({ message: "Account list not found" });
      }

      // Start checking in background
      accountChecker.startChecking(list);
      
      await storage.updateAccountList(id, { status: 'checking' });
      await storage.addActivity({
        message: `Started checking account list "${list.name}"`,
        type: 'info'
      });

      res.json({ success: true, message: "Account checking started" });
    } catch (error) {
      res.status(500).json({ message: "Failed to start account checking" });
    }
  });

  app.delete("/api/account-lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAccountList(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Account list not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account list" });
    }
  });

  // Check Results
  app.get("/api/results", async (req, res) => {
    try {
      const { listId, platform } = req.query;
      let results;
      
      if (platform) {
        results = await storage.getResultsByPlatform(platform as string);
      } else if (listId) {
        results = await storage.getCheckResults(parseInt(listId as string));
      } else {
        results = await storage.getCheckResults();
      }
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  app.get("/api/results/export/:listId", async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const results = await storage.getCheckResults(listId);
      const list = await storage.getAccountList(listId);
      
      if (!list) {
        return res.status(404).json({ message: "Account list not found" });
      }

      // Generate CSV
      const headers = ['Account', 'Platform', 'Status', 'Response Time', 'Error Message', 'Checked At'];
      const rows = results.map(r => [
        r.account,
        r.platform,
        r.isValid ? 'Valid' : 'Invalid',
        r.responseTime || '',
        r.errorMessage || '',
        r.checkedAt?.toISOString() || ''
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${list.name}_results.csv"`);
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export results" });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Analytics
  app.get("/api/analytics/platform-performance", async (req, res) => {
    try {
      const platforms = ['marktplaats.nl', 'bol.com', 'zalando', 'telenet', 'vodafone', 'tele2'];
      const performance = [];
      
      for (const platform of platforms) {
        const results = await storage.getResultsByPlatform(platform);
        const total = results.length;
        const valid = results.filter(r => r.isValid).length;
        const successRate = total > 0 ? (valid / total) * 100 : 0;
        
        performance.push({
          platform,
          successRate: Math.round(successRate * 10) / 10,
          total,
          valid,
          invalid: total - valid
        });
      }
      
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platform performance" });
    }
  });

  app.get("/api/analytics/success-trend", async (req, res) => {
    try {
      // Generate trend data for the last 7 days
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const trend = days.map(day => ({
        day,
        successRate: 80 + Math.random() * 15 // Mock data for now
      }));
      
      res.json(trend);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch success trend" });
    }
  });

  return httpServer;
}
