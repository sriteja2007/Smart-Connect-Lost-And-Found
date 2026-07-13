import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Standard credentials provided by the user
const rawUrl = process.env.SUPABASE_URL || "https://ivuzzvqwcualipofkzmf.supabase.co/rest/v1/";
const supabaseUrl = rawUrl.replace("/rest/v1/", "").replace("/rest/v1", "").trim();
const supabaseKey = process.env.SUPABASE_ANON_KEY || "sb_publishable_bT75xGZjlB3Jz9jsb-myXQ_-FeBkmdy";

console.log("[Supabase] Initializing client with base URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Robust helper to insert/upsert records to a Supabase table.
 * Catches missing table errors and logs warning messages with setup instructions.
 */
export async function syncToSupabase(tableName: string, data: any) {
  try {
    const { error } = await supabase.from(tableName).upsert(data);
    if (error) {
      if (error.code === "42P01") {
        console.warn(
          `[Supabase Warning] Table "${tableName}" does not exist in your Supabase database yet.\n` +
          `To fix this, go to your Supabase SQL Editor and run the schema queries.`
        );
      } else {
        console.error(`[Supabase Error] Failed to sync to "${tableName}":`, error.message, error.details || "");
      }
      return { success: false, error };
    }
    console.log(`[Supabase] Successfully synced record to table "${tableName}".`);
    return { success: true };
  } catch (err) {
    console.error(`[Supabase Catch] Failed syncing to "${tableName}":`, err);
    return { success: false, error: err };
  }
}

/**
 * Sync User record to Supabase
 */
export async function syncUserToSupabase(user: any) {
  return await syncToSupabase("users", {
    id: user.id,
    student_id: user.studentId,
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    department: user.department,
    role: user.role,
    points: user.points || 0,
    badges: JSON.stringify(user.badges || []),
    created_at: user.createdAt || new Date().toISOString()
  });
}

/**
 * Sync Lost Item record to Supabase
 */
export async function syncLostItemToSupabase(item: any) {
  return await syncToSupabase("lost_items", {
    id: item.id,
    reporter_id: item.reporterId,
    name: item.name,
    category: item.category,
    brand: item.brand || null,
    color: item.color,
    description: item.description,
    last_seen_location: item.lastSeenLocation,
    date_lost: item.dateLost,
    time_lost: item.timeLost || null,
    serial_number: item.serialNumber || null,
    special_marks: item.specialMarks || null,
    has_proof_of_ownership: !!item.hasProofOfOwnership,
    reward_amount: item.rewardAmount || 0,
    status: item.status || "ACTIVE",
    image_url: item.imageUrl || null,
    created_at: item.createdAt || new Date().toISOString()
  });
}

/**
 * Sync Found Item record to Supabase
 */
export async function syncFoundItemToSupabase(item: any) {
  return await syncToSupabase("found_items", {
    id: item.id,
    reporter_id: item.reporterId,
    name: item.name,
    category: item.category,
    brand: item.brand || null,
    color: item.color,
    description: item.description,
    found_location: item.foundLocation,
    date_found: item.dateFound,
    current_storage_location: item.currentStorageLocation,
    auto_tags: JSON.stringify(item.autoTags || []),
    status: item.status || "ACTIVE",
    image_url: item.imageUrl || null,
    created_at: item.createdAt || new Date().toISOString()
  });
}

/**
 * Sync Claim record to Supabase
 */
export async function syncClaimToSupabase(claim: any) {
  return await syncToSupabase("claims", {
    id: claim.id,
    item_id: claim.itemId,
    item_type: claim.itemType || "FOUND",
    claimant_id: claim.claimantId,
    student_id: claim.studentId,
    ownership_proof_description: claim.ownershipProofDescription,
    ownership_proof_files: JSON.stringify(claim.ownershipProofFiles || []),
    secret_identifier: claim.secretIdentifier,
    status: claim.status || "SUBMITTED",
    risk_score: claim.riskScore || 0,
    fraud_flags: JSON.stringify(claim.fraudFlags || []),
    created_at: claim.createdAt || new Date().toISOString(),
    updated_at: claim.updatedAt || new Date().toISOString(),
    admin_notes: claim.adminNotes || ""
  });
}

/**
 * Sync Match record to Supabase
 */
export async function syncMatchToSupabase(match: any) {
  return await syncToSupabase("matches", {
    id: match.id,
    lost_item_id: match.lostItemId,
    found_item_id: match.foundItemId,
    score: match.score || 0,
    confidence_level: match.confidenceLevel || "MEDIUM",
    matched_criteria: JSON.stringify(match.matchedCriteria || []),
    status: match.status || "PENDING",
    created_at: match.createdAt || new Date().toISOString()
  });
}

/**
 * Sync Message record to Supabase
 */
export async function syncMessageToSupabase(msg: any) {
  return await syncToSupabase("messages", {
    id: msg.id,
    conversation_id: msg.conversationId,
    sender_id: msg.senderId,
    sender_name: msg.senderName,
    sender_role: msg.senderRole,
    text: msg.text,
    image_url: msg.imageUrl || null,
    created_at: msg.createdAt || new Date().toISOString()
  });
}

/**
 * Sync Notification record to Supabase
 */
export async function syncNotificationToSupabase(notification: any) {
  return await syncToSupabase("notifications", {
    id: notification.id,
    user_id: notification.userId,
    title: notification.title,
    message: notification.message,
    type: notification.type || "INFO",
    read: !!notification.read,
    created_at: notification.createdAt || new Date().toISOString()
  });
}

// Export SQL schemas for the Supabase SQL Editor
export const SUPABASE_SQL_SCHEMAS = `
-- COPY & RUN THIS IN YOUR SUPABASE SQL EDITOR --

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  department TEXT,
  role TEXT,
  points INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Lost Items Table
CREATE TABLE IF NOT EXISTS lost_items (
  id TEXT PRIMARY KEY,
  reporter_id TEXT,
  name TEXT,
  category TEXT,
  brand TEXT,
  color TEXT,
  description TEXT,
  last_seen_location TEXT,
  date_lost DATE,
  time_lost TEXT,
  serial_number TEXT,
  special_marks TEXT,
  has_proof_of_ownership BOOLEAN DEFAULT FALSE,
  reward_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Found Items Table
CREATE TABLE IF NOT EXISTS found_items (
  id TEXT PRIMARY KEY,
  reporter_id TEXT,
  name TEXT,
  category TEXT,
  brand TEXT,
  color TEXT,
  description TEXT,
  found_location TEXT,
  date_found DATE,
  current_storage_location TEXT,
  auto_tags JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'ACTIVE',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Claims Table
CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  item_type TEXT DEFAULT 'FOUND',
  claimant_id TEXT,
  student_id TEXT,
  ownership_proof_description TEXT,
  ownership_proof_files JSONB DEFAULT '[]'::jsonb,
  secret_identifier TEXT,
  status TEXT DEFAULT 'SUBMITTED',
  risk_score NUMERIC DEFAULT 0,
  fraud_flags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  admin_notes TEXT
);

-- 5. Create Matches Table
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  lost_item_id TEXT,
  found_item_id TEXT,
  score NUMERIC,
  confidence_level TEXT,
  matched_criteria JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT,
  sender_id TEXT,
  sender_name TEXT,
  sender_role TEXT,
  text TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT,
  message TEXT,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;
