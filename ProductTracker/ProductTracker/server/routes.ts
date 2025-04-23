import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { productValidationSchema, taskValidationSchema, gameNameValidationSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Helper middleware to verify user role
const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Month record routes
  app.get("/api/month-records", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    storage.getAllMonthRecords()
      .then(records => res.json(records))
      .catch(err => res.status(500).json({ message: err.message }));
  });

  app.get("/api/month-records/active", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    storage.getActiveMonthRecords()
      .then(records => res.json(records))
      .catch(err => res.status(500).json({ message: err.message }));
  });

  app.post("/api/month-records", checkRole(["admin", "supervisor"]), (req, res) => {
    try {
      const { name, startDate, isActive, isLocked } = req.body;
      
      const monthRecordData = {
        name,
        startDate: new Date(startDate),
        endDate: null,
        isActive: isActive ?? true,
        isLocked: isLocked ?? false
      };
      
      storage.createMonthRecord(monthRecordData)
        .then(newRecord => res.status(201).json(newRecord))
        .catch(err => res.status(500).json({ message: err.message }));
    } catch (error) {
      res.status(500).json({ message: "Failed to create month record" });
    }
  });
  
  // Products API
  app.get("/api/products", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    storage.getAllProducts()
      .then(products => {
        // If user role is "user", blur sensitive data
        if (req.user && req.user.role === "user") {
          products = products.map(product => ({
            ...product,
            costPrice: null,
            sellingPrice: null,
            profit: null
          }));
        }
        res.json(products);
      })
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  app.get("/api/products/month/:month/:year", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const { month, year } = req.params;
    
    storage.getProductsByMonth(month, year)
      .then(products => {
        // If user role is "user", blur sensitive data
        if (req.user && req.user.role === "user") {
          products = products.map(product => ({
            ...product,
            costPrice: null,
            sellingPrice: null,
            profit: null
          }));
        }
        res.json(products);
      })
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  app.get("/api/products/status/:status", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const { status } = req.params;
    
    storage.getProductsByStatus(status)
      .then(products => {
        // If user role is "user", blur sensitive data
        if (req.user && req.user.role === "user") {
          products = products.map(product => ({
            ...product,
            costPrice: null,
            sellingPrice: null,
            profit: null
          }));
        }
        res.json(products);
      })
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  app.get("/api/products/:id", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const productId = parseInt(req.params.id, 10);
    
    storage.getProduct(productId)
      .then(product => {
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        
        // If user role is "user", blur sensitive data
        if (req.user && req.user.role === "user") {
          product = {
            ...product,
            costPrice: null,
            sellingPrice: null,
            profit: null
          };
        }
        
        res.json(product);
      })
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  app.post("/api/products", checkRole(["admin", "supervisor"]), (req, res) => {
    try {
      const productData = productValidationSchema.parse(req.body);
      
      // Add userId from authenticated user
      productData.userId = req.user!.id;
      
      // Calculate profit
      productData.profit = productData.sellingPrice - productData.costPrice;
      
      storage.createProduct(productData)
        .then(newProduct => res.status(201).json(newProduct))
        .catch(err => res.status(500).json({ message: err.message }));
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  app.put("/api/products/:id", checkRole(["admin", "supervisor"]), (req, res) => {
    const productId = parseInt(req.params.id, 10);
    
    try {
      // Recalculate profit if price changes
      if (req.body.costPrice !== undefined || req.body.sellingPrice !== undefined) {
        storage.getProduct(productId).then(existingProduct => {
          if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
          }
          
          const newCostPrice = req.body.costPrice ?? existingProduct.costPrice;
          const newSellingPrice = req.body.sellingPrice ?? existingProduct.sellingPrice;
          req.body.profit = newSellingPrice - newCostPrice;
          
          storage.updateProduct(productId, req.body)
            .then(updatedProduct => {
              if (!updatedProduct) {
                return res.status(404).json({ message: "Product not found" });
              }
              res.json(updatedProduct);
            })
            .catch(err => res.status(500).json({ message: err.message }));
        });
      } else {
        storage.updateProduct(productId, req.body)
          .then(updatedProduct => {
            if (!updatedProduct) {
              return res.status(404).json({ message: "Product not found" });
            }
            res.json(updatedProduct);
          })
          .catch(err => res.status(500).json({ message: err.message }));
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  
  app.delete("/api/products/:id", checkRole(["admin", "supervisor"]), (req, res) => {
    const productId = parseInt(req.params.id, 10);
    
    storage.deleteProduct(productId)
      .then(success => {
        if (!success) {
          return res.status(404).json({ message: "Product not found" });
        }
        res.status(204).end();
      })
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  // Tasks API
  app.get("/api/tasks", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    storage.getAllTasks()
      .then(tasks => res.json(tasks))
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  app.get("/api/tasks/status/:status", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const { status } = req.params;
    
    storage.getTasksByStatus(status)
      .then(tasks => res.json(tasks))
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  app.get("/api/tasks/assignee/:userId", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = parseInt(req.params.userId, 10);
    
    storage.getTasksByAssignee(userId)
      .then(tasks => res.json(tasks))
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  app.get("/api/tasks/:id", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const taskId = parseInt(req.params.id, 10);
    
    storage.getTask(taskId)
      .then(task => {
        if (!task) {
          return res.status(404).json({ message: "Task not found" });
        }
        res.json(task);
      })
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  app.post("/api/tasks", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const taskData = taskValidationSchema.parse(req.body);
      
      // Add createdBy from authenticated user
      taskData.createdBy = req.user!.id;
      
      storage.createTask(taskData)
        .then(newTask => res.status(201).json(newTask))
        .catch(err => res.status(500).json({ message: err.message }));
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  
  app.put("/api/tasks/:id", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const taskId = parseInt(req.params.id, 10);
    
    storage.updateTask(taskId, req.body)
      .then(updatedTask => {
        if (!updatedTask) {
          return res.status(404).json({ message: "Task not found" });
        }
        res.json(updatedTask);
      })
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  app.delete("/api/tasks/:id", checkRole(["admin", "supervisor"]), (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    
    storage.deleteTask(taskId)
      .then(success => {
        if (!success) {
          return res.status(404).json({ message: "Task not found" });
        }
        res.status(204).end();
      })
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  // Users API - only accessible to admins
  app.get("/api/users", checkRole(["admin"]), (req, res) => {
    storage.getAllUsers()
      .then(users => {
        // Don't send password
        const sanitizedUsers = users.map(({ password, ...user }) => user);
        res.json(sanitizedUsers);
      })
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  // Reports API
  app.get("/api/reports/monthly", checkRole(["admin", "supervisor"]), (req, res) => {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }
    
    storage.getProductsByMonth(month as string, year as string)
      .then(products => {
        // Calculate totals
        const totalProducts = products.length;
        const soldProducts = products.filter(p => p.status === "sold").length;
        const availableProducts = products.filter(p => p.status === "available").length;
        
        const totalCost = products.reduce((sum, p) => sum + p.costPrice, 0);
        const totalRevenue = products.filter(p => p.status === "sold")
          .reduce((sum, p) => sum + p.sellingPrice, 0);
        const totalProfit = products.filter(p => p.status === "sold")
          .reduce((sum, p) => sum + p.profit, 0);
        
        res.json({
          totalProducts,
          soldProducts,
          availableProducts,
          totalCost,
          totalRevenue,
          totalProfit,
          products
        });
      })
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  // Game Names API
  app.get("/api/game-names", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    storage.getAllGameNames()
      .then(gameNames => res.json(gameNames))
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  app.get("/api/game-names/:id", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const gameNameId = parseInt(req.params.id, 10);
    
    storage.getGameName(gameNameId)
      .then(gameName => {
        if (!gameName) {
          return res.status(404).json({ message: "Game name not found" });
        }
        res.json(gameName);
      })
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  app.post("/api/game-names", checkRole(["admin"]), (req, res) => {
    try {
      const gameNameData = gameNameValidationSchema.parse(req.body);
      
      // Add createdBy from authenticated user
      gameNameData.createdBy = req.user!.id;
      
      storage.createGameName(gameNameData)
        .then(newGameName => res.status(201).json(newGameName))
        .catch(err => res.status(500).json({ message: err.message }));
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create game name" });
    }
  });
  
  app.delete("/api/game-names/:id", checkRole(["admin"]), (req, res) => {
    const gameNameId = parseInt(req.params.id, 10);
    
    storage.deleteGameName(gameNameId)
      .then(success => {
        if (!success) {
          return res.status(404).json({ message: "Game name not found" });
        }
        res.status(204).end();
      })
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  // Month Records Additional Routes
  app.patch("/api/month-records/:id", checkRole(["admin"]), (req, res) => {
    const monthRecordId = parseInt(req.params.id, 10);
    
    storage.updateMonthRecord(monthRecordId, req.body)
      .then(updatedRecord => {
        if (!updatedRecord) {
          return res.status(404).json({ message: "Month record not found" });
        }
        res.json(updatedRecord);
      })
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  app.patch("/api/month-records/:id/lock", checkRole(["admin"]), (req, res) => {
    const monthRecordId = parseInt(req.params.id, 10);
    const { isLocked } = req.body;
    
    if (isLocked) {
      storage.lockMonthRecord(monthRecordId)
        .then(success => {
          if (!success) {
            return res.status(404).json({ message: "Month record not found" });
          }
          res.json({ success: true, message: "Month record locked successfully" });
        })
        .catch(err => res.status(500).json({ message: err.message }));
    } else {
      // Unlock the month record by updating isLocked to false
      storage.updateMonthRecord(monthRecordId, { isLocked: false })
        .then(updatedRecord => {
          if (!updatedRecord) {
            return res.status(404).json({ message: "Month record not found" });
          }
          res.json(updatedRecord);
        })
        .catch(err => res.status(500).json({ message: err.message }));
    }
  });
  
  app.post("/api/month-records/:id/clear", checkRole(["admin"]), (req, res) => {
    const monthRecordId = parseInt(req.params.id, 10);
    
    storage.clearMonthRecordData(monthRecordId)
      .then(success => {
        if (!success) {
          return res.status(404).json({ message: "Month record not found or could not be cleared" });
        }
        res.json({ success: true, message: "Month record data cleared successfully" });
      })
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
