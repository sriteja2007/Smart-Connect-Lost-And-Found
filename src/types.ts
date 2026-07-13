/**
 * CampusConnect Lost & Found Types
 */

export enum UserRole {
  STUDENT = "STUDENT",
  FACULTY_STAFF = "FACULTY_STAFF",
  SECURITY_OFFICE = "SECURITY_OFFICE",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export interface User {
  id: string;
  studentId: string; // or Employee ID
  name: string;
  email: string;
  phone?: string;
  department: string;
  role: UserRole;
  points: number;
  badges: string[]; // Badge IDs
  createdAt: string;
}

export type ItemCategory =
  | "ELECTRONICS"
  | "BOOKS"
  | "ID_CARDS"
  | "WALLETS"
  | "KEYS"
  | "CLOTHING"
  | "ACCESSORIES"
  | "OTHERS";

export interface LostItem {
  id: string;
  reporterId: string;
  name: string;
  category: ItemCategory;
  brand?: string;
  color: string;
  description: string;
  lastSeenLocation: string;
  dateLost: string; // YYYY-MM-DD
  timeLost?: string;
  serialNumber?: string;
  specialMarks?: string;
  hasProofOfOwnership: boolean;
  rewardAmount?: number;
  imageUrl?: string;
  status: "ACTIVE" | "MATCHED" | "CLAIMED" | "CLOSED";
  createdAt: string;
}

export interface FoundItem {
  id: string;
  reporterId: string;
  name: string;
  category: ItemCategory;
  brand?: string;
  color: string;
  description: string;
  foundLocation: string;
  dateFound: string; // YYYY-MM-DD
  currentStorageLocation: string; // e.g. "Security Office Cabinet B"
  imageUrl?: string;
  autoTags: string[];
  status: "ACTIVE" | "MATCHED" | "CLAIMED" | "CLOSED";
  createdAt: string;
}

export interface MatchResult {
  id: string;
  lostItemId: string;
  foundItemId: string;
  score: number; // 0-100
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
  matchedCriteria: string[]; // e.g. ["Category", "Color", "Location"]
  status: "PENDING" | "APPROVED" | "DISMISSED";
  createdAt: string;
}

export type ClaimStatus =
  | "SUBMITTED"
  | "REVIEW"
  | "VERIFICATION"
  | "APPROVED"
  | "REJECTED"
  | "RECOVERED";

export interface Claim {
  id: string;
  itemId: string; // found item ID
  itemType: "FOUND";
  claimantId: string;
  studentId: string;
  ownershipProofDescription: string;
  ownershipProofFiles: string[]; // Base64 or URLs
  secretIdentifier: string; // "Secret details only the owner knows"
  status: ClaimStatus;
  adminNotes?: string;
  riskScore: number; // 0-100 (fraud prevention flagger)
  fraudFlags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string; // e.g. "claim-claimId" or "item-itemId"
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "MATCH" | "CLAIM" | "CHAT" | "SYSTEM" | "GAMIFICATION";
  read: boolean;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  pointsRequired: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  department: string;
  role: UserRole;
  points: number;
  badgesCount: number;
  rank: number;
}

export interface CampusDepartment {
  id: string;
  name: string;
  totalLost: number;
  totalFound: number;
  recoveryRate: number; // percentage
}

export interface MapPin {
  id: string;
  type: "LOST" | "FOUND" | "HOTSPOT";
  name: string;
  category: ItemCategory;
  locationName: string;
  x: number; // percentage coordinate on SVG Map 0-100
  y: number; // percentage coordinate on SVG Map 0-100
  intensity?: number; // for heatmap risk overlay
}
