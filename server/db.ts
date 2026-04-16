import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, profiles, questionnaireAnswers, colorPalettes, userPreferences } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Profile queries
export async function createProfile(userId: number, name: string, emoji: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(profiles).values({ userId, name, emoji });
  return result;
}

export async function getUserProfiles(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(profiles).where(eq(profiles.userId, userId));
}

export async function updateProfile(profileId: number, name: string, emoji: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(profiles).set({ name, emoji }).where(eq(profiles.id, profileId));
}

export async function deleteProfile(profileId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(profiles).where(eq(profiles.id, profileId));
}

// Questionnaire answers queries
export async function saveQuestionnaireAnswers(profileId: number, answers: Record<string, any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(questionnaireAnswers).where(eq(questionnaireAnswers.profileId, profileId));
  
  if (existing.length > 0) {
    return await db.update(questionnaireAnswers).set({ answers }).where(eq(questionnaireAnswers.profileId, profileId));
  }
  return await db.insert(questionnaireAnswers).values({ profileId, answers });
}

export async function getQuestionnaireAnswers(profileId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(questionnaireAnswers).where(eq(questionnaireAnswers.profileId, profileId));
  return result.length > 0 ? result[0] : null;
}

// Color palette queries
export async function createColorPalette(userId: number, name: string, colors: Record<string, string>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(colorPalettes).values({ userId, name, colors });
}

export async function getUserColorPalettes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(colorPalettes).where(eq(colorPalettes.userId, userId));
}

export async function updateColorPalette(paletteId: number, name: string, colors: Record<string, string>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(colorPalettes).set({ name, colors }).where(eq(colorPalettes.id, paletteId));
}

export async function deleteColorPalette(paletteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(colorPalettes).where(eq(colorPalettes.id, paletteId));
}

// User preferences queries
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
  return result.length > 0 ? result[0] : null;
}

export async function updateUserPreferences(userId: number, selectedPaletteId?: number | null, theme?: "light" | "dark") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getUserPreferences(userId);
  
  if (existing) {
    const updates: any = {};
    if (selectedPaletteId !== undefined) updates.selectedPaletteId = selectedPaletteId;
    if (theme !== undefined) updates.theme = theme;
    return await db.update(userPreferences).set(updates).where(eq(userPreferences.userId, userId));
  }
  return await db.insert(userPreferences).values({ userId, selectedPaletteId: selectedPaletteId || null, theme: theme || "dark" });
}


