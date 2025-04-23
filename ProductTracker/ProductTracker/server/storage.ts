import { User, InsertUser, Product, InsertProduct, Task, InsertTask, GameName, InsertGameName, MonthRecord, InsertMonthRecord } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { users, products, tasks, gameNames, monthRecords } from "@shared/schema";

const PostgresSessionStore = connectPg(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  resetUserPassword(id: number, newPassword: string): Promise<boolean>;
  updateUserActivity(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  // Game name operations
  getGameName(id: number): Promise<GameName | undefined>;
  getGameNameByName(name: string): Promise<GameName | undefined>;
  createGameName(gameName: InsertGameName): Promise<GameName>;
  deleteGameName(id: number): Promise<boolean>;
  getAllGameNames(): Promise<GameName[]>;
  
  // Month record operations
  getMonthRecord(id: number): Promise<MonthRecord | undefined>;
  getCurrentMonthRecord(): Promise<MonthRecord | undefined>;
  createMonthRecord(monthRecord: InsertMonthRecord): Promise<MonthRecord>;
  updateMonthRecord(id: number, monthRecord: Partial<MonthRecord>): Promise<MonthRecord | undefined>;
  lockMonthRecord(id: number): Promise<boolean>;
  clearMonthRecordData(id: number): Promise<boolean>;
  getAllMonthRecords(): Promise<MonthRecord[]>;
  getActiveMonthRecords(): Promise<MonthRecord[]>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getAllProducts(): Promise<Product[]>;
  getProductsByMonthRecord(monthRecordId: number): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductsByStatus(status: string): Promise<Product[]>;
  
  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getAllTasks(): Promise<Task[]>;
  getTasksByStatus(status: string): Promise<Task[]>;
  getTasksByAssignee(userId: number): Promise<Task[]>;
  
  // For session storage
  sessionStore: any;
}

// We've removed the MemStorage implementation as we're now using the database

// Database implementation
export class DatabaseStorage implements IStorage {
  sessionStore: any; // We use any type for session store to avoid type issues

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  //================= User operations =================
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Force new users to have the "new_user" role
    const userData = {
      ...insertUser,
      role: "new_user" as const,
    };

    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async resetUserPassword(id: number, newPassword: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async updateUserActivity(id: number): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return false;

    const now = new Date();
    const lastActive = user.lastActive || now;
    const timeDiffSeconds = Math.floor((now.getTime() - lastActive.getTime()) / 1000);

    const result = await db
      .update(users)
      .set({
        lastActive: now,
        totalActiveTime: (user.totalActiveTime || 0) + timeDiffSeconds,
      })
      .where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  //================= Game name operations =================
  async getGameName(id: number): Promise<GameName | undefined> {
    const [gameName] = await db
      .select()
      .from(gameNames)
      .where(eq(gameNames.id, id));
    return gameName;
  }

  async getGameNameByName(name: string): Promise<GameName | undefined> {
    const [gameName] = await db
      .select()
      .from(gameNames)
      .where(eq(gameNames.name, name));
    return gameName;
  }

  async createGameName(insertGameName: InsertGameName): Promise<GameName> {
    const [gameName] = await db
      .insert(gameNames)
      .values(insertGameName)
      .returning();
    return gameName;
  }

  async deleteGameName(id: number): Promise<boolean> {
    const result = await db.delete(gameNames).where(eq(gameNames.id, id));
    return result.rowCount > 0;
  }

  async getAllGameNames(): Promise<GameName[]> {
    return db.select().from(gameNames);
  }

  //================= Month record operations =================
  async getMonthRecord(id: number): Promise<MonthRecord | undefined> {
    const [monthRecord] = await db
      .select()
      .from(monthRecords)
      .where(eq(monthRecords.id, id));
    return monthRecord;
  }

  async getCurrentMonthRecord(): Promise<MonthRecord | undefined> {
    const [monthRecord] = await db
      .select()
      .from(monthRecords)
      .where(eq(monthRecords.isActive, true));
    return monthRecord;
  }

  async createMonthRecord(insertMonthRecord: InsertMonthRecord): Promise<MonthRecord> {
    const [monthRecord] = await db
      .insert(monthRecords)
      .values(insertMonthRecord)
      .returning();
    return monthRecord;
  }

  async updateMonthRecord(
    id: number,
    monthRecordUpdate: Partial<MonthRecord>
  ): Promise<MonthRecord | undefined> {
    const [updatedMonthRecord] = await db
      .update(monthRecords)
      .set(monthRecordUpdate)
      .where(eq(monthRecords.id, id))
      .returning();
    return updatedMonthRecord;
  }

  async lockMonthRecord(id: number): Promise<boolean> {
    const result = await db
      .update(monthRecords)
      .set({
        isLocked: true,
        isActive: false,
        endDate: new Date(),
      })
      .where(eq(monthRecords.id, id));
    return result.rowCount > 0;
  }

  async clearMonthRecordData(id: number): Promise<boolean> {
    const [monthRecord] = await db
      .select()
      .from(monthRecords)
      .where(eq(monthRecords.id, id));
    if (!monthRecord || !monthRecord.isLocked) return false;

    // Delete all products associated with this month record
    await db.delete(products).where(eq(products.monthRecordId, id));
    return true;
  }

  async getAllMonthRecords(): Promise<MonthRecord[]> {
    return db.select().from(monthRecords);
  }

  async getActiveMonthRecords(): Promise<MonthRecord[]> {
    return db
      .select()
      .from(monthRecords)
      .where(eq(monthRecords.isLocked, false));
  }

  //================= Product operations =================
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const productData = {
      ...insertProduct,
      dateReceived: insertProduct.dateReceived || new Date(),
      status: insertProduct.status || "available",
    };
    
    const [product] = await db
      .insert(products)
      .values(productData)
      .returning();
    return product;
  }

  async updateProduct(
    id: number,
    productUpdate: Partial<Product>
  ): Promise<Product | undefined> {
    // Check if we're trying to update a product in a locked month
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    
    if (!product) return undefined;
    
    if (product.monthRecordId) {
      const [monthRecord] = await db
        .select()
        .from(monthRecords)
        .where(eq(monthRecords.id, product.monthRecordId));
        
      if (monthRecord && monthRecord.isLocked) {
        throw new Error("Cannot update product in a locked month");
      }
    }

    const [updatedProduct] = await db
      .update(products)
      .set(productUpdate)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    // Check if we're trying to delete a product in a locked month
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
      
    if (!product) return false;
    
    if (product.monthRecordId) {
      const [monthRecord] = await db
        .select()
        .from(monthRecords)
        .where(eq(monthRecords.id, product.monthRecordId));
        
      if (monthRecord && monthRecord.isLocked) {
        throw new Error("Cannot delete product in a locked month");
      }
    }

    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProductsByMonthRecord(monthRecordId: number): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(eq(products.monthRecordId, monthRecordId));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(eq(products.category, category));
  }

  async getProductsByStatus(status: string): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(eq(products.status, status));
  }

  // For backward compatibility
  async getProductsByMonth(month: string, year: string): Promise<Product[]> {
    // This is a compatibility method for transition
    // Simply return all products for now
    return db.select().from(products);
  }

  //================= Task operations =================
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const taskData = {
      ...insertTask,
      status: insertTask.status || "started",
    };
    
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  }

  async updateTask(
    id: number,
    taskUpdate: Partial<Task>
  ): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(taskUpdate)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }

  async getAllTasks(): Promise<Task[]> {
    return db.select().from(tasks);
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.status, status));
  }

  async getTasksByAssignee(userId: number): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedTo, userId));
  }
}

export const storage = new DatabaseStorage();
