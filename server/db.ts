import fs from "fs";
import path from "path";
import {
  User,
  UserRole,
  LostItem,
  FoundItem,
  MatchResult,
  Claim,
  Message,
  Notification,
  Badge,
  CampusDepartment,
  MapPin,
  ItemCategory
} from "../src/types";
import {
  syncUserToSupabase,
  syncLostItemToSupabase,
  syncFoundItemToSupabase,
  syncClaimToSupabase,
  syncMatchToSupabase,
  syncMessageToSupabase,
  syncNotificationToSupabase
} from "./supabase";

const DB_FILE = path.join(process.cwd(), "server", "data.json");

interface DatabaseSchema {
  users: User[];
  lostItems: LostItem[];
  foundItems: FoundItem[];
  matches: MatchResult[];
  claims: Claim[];
  messages: Message[];
  notifications: Notification[];
  badges: Badge[];
}

// Ensure the directory exists
function ensureDirectory() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Default Seed Data
const DEFAULT_BADGES: Badge[] = [
  { id: "honest-finder", name: "Honest Finder", description: "Reported and returned a found item to security", icon: "CheckCircle", pointsRequired: 50 },
  { id: "campus-hero", name: "Campus Hero", description: "Successfully returned 5 or more found items", icon: "Shield", pointsRequired: 250 },
  { id: "recovery-champion", name: "Recovery Champion", description: "Assisted the Security Office in resolving a claim dispute", icon: "Award", pointsRequired: 150 },
  { id: "vigilant-citizen", name: "Vigilant Citizen", description: "Log details with precise markings helping quick match", icon: "Eye", pointsRequired: 30 }
];

const INITIAL_USERS: User[] = [
  {
    id: "usr_student_alice",
    studentId: "S202451",
    name: "Alice Chen",
    email: "alice.chen@campus.edu",
    phone: "555-0192",
    department: "Computer Science",
    role: UserRole.STUDENT,
    points: 120,
    badges: ["honest-finder", "vigilant-citizen"],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "usr_student_bob",
    studentId: "S202488",
    name: "Bob Jones",
    email: "bob.jones@campus.edu",
    phone: "555-0143",
    department: "Mechanical Engineering",
    role: UserRole.STUDENT,
    points: 30,
    badges: ["honest-finder"],
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "usr_faculty_miller",
    studentId: "F80410",
    name: "Dr. Robert Miller",
    email: "r.miller@campus.edu",
    phone: "555-0177",
    department: "Physics",
    role: UserRole.FACULTY_STAFF,
    points: 60,
    badges: ["honest-finder", "vigilant-citizen"],
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "usr_security_dave",
    studentId: "SEC-007",
    name: "Officer Dave Robinson",
    email: "dave.robinson@campus.edu",
    phone: "555-9000",
    department: "Campus Security Office",
    role: UserRole.SECURITY_OFFICE,
    points: 0,
    badges: [],
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "usr_admin_susan",
    studentId: "ADM-001",
    name: "Professor Susan Wright",
    email: "susan.wright@campus.edu",
    phone: "555-8888",
    department: "Office of the Provost",
    role: UserRole.SUPER_ADMIN,
    points: 0,
    badges: [],
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_LOST_ITEMS: LostItem[] = [
  {
    id: "lost_01",
    reporterId: "usr_student_alice",
    name: "Space Grey iPad Pro 11-inch",
    category: "ELECTRONICS",
    brand: "Apple",
    color: "Grey",
    description: "Has a black magnetic folio cover and an Apple Pencil 2 attached. Back has a small scratch near the logo.",
    lastSeenLocation: "Engineering Building Library, 3rd Floor",
    dateLost: "2026-07-10",
    timeLost: "14:30",
    serialNumber: "DMPX810283K",
    specialMarks: "Slight scratch near Apple logo on the rear casing",
    hasProofOfOwnership: true,
    rewardAmount: 50,
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "lost_02",
    reporterId: "usr_student_bob",
    name: "Brown Leather Tri-fold Wallet",
    category: "WALLETS",
    brand: "Fossil",
    color: "Brown",
    description: "Contains student ID card for Bob Jones and various metro passes. Small tear on the inner pocket.",
    lastSeenLocation: "Campus Recreation Gym locker rooms",
    dateLost: "2026-07-11",
    timeLost: "18:00",
    specialMarks: "Inner pocket has a slight tear",
    hasProofOfOwnership: false,
    rewardAmount: 20,
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_FOUND_ITEMS: FoundItem[] = [
  {
    id: "found_01",
    reporterId: "usr_faculty_miller",
    name: "iPad Pro with Stylus",
    category: "ELECTRONICS",
    brand: "Apple",
    color: "Space Grey",
    description: "Found sitting on a study desk on the 3rd floor of the Engineering library. Black cover, digital stylus attached.",
    foundLocation: "Engineering Building Library Desk #43",
    dateFound: "2026-07-11",
    currentStorageLocation: "Security Office locker row A, Shelf 3",
    autoTags: ["Apple", "Tablet", "iPad", "Stylus", "Grey"],
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "found_02",
    reporterId: "usr_student_alice",
    name: "Car Keys with Red Keychain tag",
    category: "KEYS",
    brand: "Toyota",
    color: "Black/Silver",
    description: "Found on the sidewalk near the campus fountain. Key fob has a red silicon tag saying 'LUCKY'.",
    foundLocation: "University Central Fountain Plaza",
    dateFound: "2026-07-12",
    currentStorageLocation: "Front Security Desk Drawer #2",
    autoTags: ["Toyota", "Key", "Fob", "Red tag", "Lucky"],
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_CLAIMS: Claim[] = [
  {
    id: "claim_01",
    itemId: "found_01",
    itemType: "FOUND",
    claimantId: "usr_student_alice",
    studentId: "S202451",
    ownershipProofDescription: "I have the original purchase invoice from Apple Store and a photo of me using it. The lock screen background is a picture of my pet cat named Luna.",
    ownershipProofFiles: [],
    secretIdentifier: "Lockscreen picture of a grey tabby cat called Luna",
    status: "SUBMITTED",
    riskScore: 5,
    fraudFlags: [],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_MATCHES: MatchResult[] = [
  {
    id: "match_01",
    lostItemId: "lost_01",
    foundItemId: "found_01",
    score: 94,
    confidenceLevel: "HIGH",
    matchedCriteria: ["Category", "Brand", "Color", "Location proximity"],
    status: "PENDING",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg_01",
    conversationId: "claim_claim_01",
    senderId: "usr_student_alice",
    senderName: "Alice Chen",
    senderRole: UserRole.STUDENT,
    text: "Hi, I have filed a claim for this iPad. It has my study notes on it and I really need it for my finals. Can security please verify it?",
    createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "msg_02",
    conversationId: "claim_claim_01",
    senderId: "usr_security_dave",
    senderName: "Officer Dave Robinson",
    senderRole: UserRole.SECURITY_OFFICE,
    text: "Hello Alice. I see your claim submission. Could you please confirm if there is any custom sticker or engraving on the back?",
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "not_01",
    userId: "usr_student_alice",
    title: "High Match Detected!",
    message: "A potential match has been found for your Space Grey iPad Pro 11-inch (94% confidence).",
    type: "MATCH",
    read: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export class DB {
  private static data: DatabaseSchema;

  static load() {
    ensureDirectory();
    if (!fs.existsSync(DB_FILE)) {
      this.data = {
        users: INITIAL_USERS,
        lostItems: INITIAL_LOST_ITEMS,
        foundItems: INITIAL_FOUND_ITEMS,
        matches: INITIAL_MATCHES,
        claims: INITIAL_CLAIMS,
        messages: INITIAL_MESSAGES,
        notifications: INITIAL_NOTIFICATIONS,
        badges: DEFAULT_BADGES
      };
      this.save();
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
        // Ensure default arrays are present
        if (!this.data.users) this.data.users = INITIAL_USERS;
        if (!this.data.lostItems) this.data.lostItems = INITIAL_LOST_ITEMS;
        if (!this.data.foundItems) this.data.foundItems = INITIAL_FOUND_ITEMS;
        if (!this.data.matches) this.data.matches = INITIAL_MATCHES;
        if (!this.data.claims) this.data.claims = INITIAL_CLAIMS;
        if (!this.data.messages) this.data.messages = INITIAL_MESSAGES;
        if (!this.data.notifications) this.data.notifications = INITIAL_NOTIFICATIONS;
        if (!this.data.badges) this.data.badges = DEFAULT_BADGES;
      } catch (err) {
        console.error("Failed to read database, resetting to initial state", err);
        this.data = {
          users: INITIAL_USERS,
          lostItems: INITIAL_LOST_ITEMS,
          foundItems: INITIAL_FOUND_ITEMS,
          matches: INITIAL_MATCHES,
          claims: INITIAL_CLAIMS,
          messages: INITIAL_MESSAGES,
          notifications: INITIAL_NOTIFICATIONS,
          badges: DEFAULT_BADGES
        };
        this.save();
      }
    }
  }

  static save() {
    ensureDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
  }

  // --- USERS ---
  static getUsers(): User[] {
    this.load();
    return this.data.users;
  }

  static getUserById(id: string): User | undefined {
    this.load();
    return this.data.users.find((u) => u.id === id);
  }

  static getUserByEmail(email: string): User | undefined {
    this.load();
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  static getUserByStudentId(studentId: string): User | undefined {
    this.load();
    return this.data.users.find((u) => u.studentId === studentId);
  }

  static createUser(user: Omit<User, "id" | "points" | "badges" | "createdAt">): User {
    this.load();
    const newUser: User = {
      ...user,
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      points: 10, // Initial points for joining
      badges: [],
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    syncUserToSupabase(newUser).catch(err => console.error("Supabase user sync failed:", err));
    return newUser;
  }

  static updateUserPoints(userId: string, pointsToAdd: number, badgeIdToAward?: string) {
    this.load();
    const user = this.data.users.find((u) => u.id === userId);
    if (user) {
      user.points += pointsToAdd;
      if (badgeIdToAward && !user.badges.includes(badgeIdToAward)) {
        user.badges.push(badgeIdToAward);
        this.createNotification(userId, "Badge Unlocked! 🏆", `You've unlocked the badge: "${badgeIdToAward.toUpperCase().replace("-", " ")}"`, "GAMIFICATION");
      }
      this.save();
      syncUserToSupabase(user).catch(err => console.error("Supabase user points sync failed:", err));
    }
  }

  // --- LOST ITEMS ---
  static getLostItems(): LostItem[] {
    this.load();
    return this.data.lostItems;
  }

  static getLostItemById(id: string): LostItem | undefined {
    this.load();
    return this.data.lostItems.find((item) => item.id === id);
  }

  static createLostItem(item: Omit<LostItem, "id" | "status" | "createdAt">): LostItem {
    this.load();
    const newItem: LostItem = {
      ...item,
      id: "lost_" + Math.random().toString(36).substr(2, 9),
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    };
    this.data.lostItems.push(newItem);
    this.save();
    syncLostItemToSupabase(newItem).catch(err => console.error("Supabase lost item sync failed:", err));
    return newItem;
  }

  static updateLostItemStatus(id: string, status: LostItem["status"]) {
    this.load();
    const item = this.data.lostItems.find((i) => i.id === id);
    if (item) {
      item.status = status;
      this.save();
      syncLostItemToSupabase(item).catch(err => console.error("Supabase lost item status sync failed:", err));
    }
  }

  // --- FOUND ITEMS ---
  static getFoundItems(): FoundItem[] {
    this.load();
    return this.data.foundItems;
  }

  static getFoundItemById(id: string): FoundItem | undefined {
    this.load();
    return this.data.foundItems.find((item) => item.id === id);
  }

  static createFoundItem(item: Omit<FoundItem, "id" | "status" | "createdAt">): FoundItem {
    this.load();
    const newItem: FoundItem = {
      ...item,
      id: "found_" + Math.random().toString(36).substr(2, 9),
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    };
    this.data.foundItems.push(newItem);
    this.save();
    syncFoundItemToSupabase(newItem).catch(err => console.error("Supabase found item sync failed:", err));
    return newItem;
  }

  static updateFoundItemStatus(id: string, status: FoundItem["status"]) {
    this.load();
    const item = this.data.foundItems.find((i) => i.id === id);
    if (item) {
      item.status = status;
      this.save();
      syncFoundItemToSupabase(item).catch(err => console.error("Supabase found item status sync failed:", err));
    }
  }

  // --- MATCHES ---
  static getMatches(): MatchResult[] {
    this.load();
    return this.data.matches;
  }

  static createMatch(match: Omit<MatchResult, "id" | "createdAt">): MatchResult {
    this.load();
    const newMatch: MatchResult = {
      ...match,
      id: "match_" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.data.matches.push(newMatch);
    this.save();
    syncMatchToSupabase(newMatch).catch(err => console.error("Supabase match sync failed:", err));
    return newMatch;
  }

  static updateMatchStatus(id: string, status: MatchResult["status"]) {
    this.load();
    const match = this.data.matches.find((m) => m.id === id);
    if (match) {
      match.status = status;
      this.save();
      syncMatchToSupabase(match).catch(err => console.error("Supabase match status sync failed:", err));
    }
  }

  // --- CLAIMS ---
  static getClaims(): Claim[] {
    this.load();
    return this.data.claims;
  }

  static getClaimById(id: string): Claim | undefined {
    this.load();
    return this.data.claims.find((c) => c.id === id);
  }

  static createClaim(claim: Omit<Claim, "id" | "status" | "createdAt" | "updatedAt">): Claim {
    this.load();
    const newClaim: Claim = {
      ...claim,
      id: "claim_" + Math.random().toString(36).substr(2, 9),
      status: "SUBMITTED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.claims.push(newClaim);
    this.save();
    syncClaimToSupabase(newClaim).catch(err => console.error("Supabase claim sync failed:", err));
    return newClaim;
  }

  static updateClaimStatus(id: string, status: Claim["status"], adminNotes?: string) {
    this.load();
    const claim = this.data.claims.find((c) => c.id === id);
    if (claim) {
      claim.status = status;
      claim.updatedAt = new Date().toISOString();
      if (adminNotes) {
        claim.adminNotes = adminNotes;
      }
      this.save();
      syncClaimToSupabase(claim).catch(err => console.error("Supabase claim status sync failed:", err));
    }
  }

  // --- MESSAGES ---
  static getMessages(conversationId: string): Message[] {
    this.load();
    return this.data.messages.filter((m) => m.conversationId === conversationId);
  }

  static createMessage(msg: Omit<Message, "id" | "createdAt">): Message {
    this.load();
    const newMessage: Message = {
      ...msg,
      id: "msg_" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.data.messages.push(newMessage);
    this.save();
    syncMessageToSupabase(newMessage).catch(err => console.error("Supabase message sync failed:", err));
    return newMessage;
  }

  // --- NOTIFICATIONS ---
  static getNotifications(userId: string): Notification[] {
    this.load();
    return this.data.notifications.filter((n) => n.userId === userId);
  }

  static createNotification(userId: string, title: string, message: string, type: Notification["type"]): Notification {
    this.load();
    const newNot: Notification = {
      id: "not_" + Math.random().toString(36).substr(2, 9),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.push(newNot);
    this.save();
    syncNotificationToSupabase(newNot).catch(err => console.error("Supabase notification sync failed:", err));
    return newNot;
  }

  static markNotificationsAsRead(userId: string) {
    this.load();
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) {
        n.read = true;
        syncNotificationToSupabase(n).catch(err => console.error("Supabase notification read status sync failed:", err));
      }
    });
    this.save();
  }

  // --- SYSTEM SEED SEEDS ---
  static getBadges(): Badge[] {
    this.load();
    return this.data.badges;
  }
}
