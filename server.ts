import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { DB } from "./server/db";
import { UserRole, LostItem, FoundItem, Claim, ClaimStatus, ItemCategory } from "./src/types";

// Load environment variables
dotenv.config();

// Initialize Database
DB.load();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini SDK
let ai: GoogleGenAI | null = null;
const geminiKey = process.env.GEMINI_API_KEY;

if (geminiKey && geminiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Google GenAI initialized successfully with API Key.");
  } catch (error) {
    console.error("Failed to initialize Google GenAI SDK:", error);
  }
} else {
  console.log("Google GenAI API Key is not set or using placeholder. Running in heuristic fallback mode.");
}

// --------------------------------------------------------
// HEURISTIC MATCHING FALLBACK
// --------------------------------------------------------
function computeHeuristicMatch(lost: LostItem, found: FoundItem) {
  let score = 0;
  const matchedCriteria: string[] = [];

  // 1. Category matches (Crucial)
  if (lost.category === found.category) {
    score += 40;
    matchedCriteria.push("Category");
  } else {
    return null; // Don't match different major categories
  }

  // 2. Brand matching
  if (lost.brand && found.brand) {
    if (lost.brand.toLowerCase() === found.brand.toLowerCase()) {
      score += 20;
      matchedCriteria.push("Brand");
    } else if (
      lost.brand.toLowerCase().includes(found.brand.toLowerCase()) ||
      found.brand.toLowerCase().includes(lost.brand.toLowerCase())
    ) {
      score += 10;
      matchedCriteria.push("Brand proximity");
    }
  }

  // 3. Color matching
  if (lost.color && found.color) {
    const lColors = lost.color.toLowerCase().split(/[\s/]+/);
    const fColors = found.color.toLowerCase().split(/[\s/]+/);
    const hasColorOverlap = lColors.some(c => fColors.some(fc => fc.includes(c) || c.includes(fc)));
    if (hasColorOverlap) {
      score += 15;
      matchedCriteria.push("Color similarity");
    }
  }

  // 4. Description keywords matching
  const lDescWords = lost.description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const fDescWords = found.description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const intersection = lDescWords.filter(w => fDescWords.includes(w));
  if (intersection.length > 0) {
    score += Math.min(15, intersection.length * 3);
    matchedCriteria.push("Keyword overlap");
  }

  // 5. Location matching
  const lLoc = lost.lastSeenLocation.toLowerCase();
  const fLoc = found.foundLocation.toLowerCase();
  if (lLoc === fLoc) {
    score += 10;
    matchedCriteria.push("Location exact match");
  } else if (
    lLoc.includes("library") && fLoc.includes("library") ||
    lLoc.includes("gym") && fLoc.includes("gym") ||
    lLoc.includes("engineering") && fLoc.includes("engineering")
  ) {
    score += 8;
    matchedCriteria.push("Campus zone proximity");
  }

  // Ensure score capped at 98 without AI
  score = Math.min(95, score);

  if (score < 30) return null; // Ignore very poor matches

  return {
    score,
    confidenceLevel: (score >= 80 ? "HIGH" : score >= 50 ? "MEDIUM" : "LOW") as "HIGH" | "MEDIUM" | "LOW",
    matchedCriteria
  };
}

// --------------------------------------------------------
// API ENDPOINTS
// --------------------------------------------------------

// Auth API
app.post("/api/auth/login", (req, res) => {
  const { email, studentId } = req.body;
  if (!email && !studentId) {
    return res.status(400).json({ error: "Email or Student ID is required" });
  }

  let user = email
    ? DB.getUserByEmail(email)
    : DB.getUserByStudentId(studentId);

  if (!user) {
    // Return standard error to allow registration
    return res.status(404).json({ error: "User not found. Please register." });
  }

  res.json({ user });
});

app.post("/api/auth/register", (req, res) => {
  const { name, studentId, email, phone, department, role } = req.body;
  if (!name || !studentId || !email || !department) {
    return res.status(400).json({ error: "Missing required registration fields" });
  }

  // Check duplicate
  const existingEmail = DB.getUserByEmail(email);
  const existingId = DB.getUserByStudentId(studentId);
  if (existingEmail || existingId) {
    return res.status(400).json({ error: "User with this Email or ID already exists." });
  }

  const userRole = role || UserRole.STUDENT;

  const user = DB.createUser({
    name,
    studentId,
    email,
    phone,
    department,
    role: userRole as UserRole
  });

  res.status(201).json({ user });
});

// Users listing (Admin)
app.get("/api/users", (req, res) => {
  res.json({ users: DB.getUsers() });
});

// Lost Items API
app.get("/api/lost-items", (req, res) => {
  res.json({ items: DB.getLostItems() });
});

app.post("/api/lost-items", async (req, res) => {
  const { reporterId, name, category, brand, color, description, lastSeenLocation, dateLost, timeLost, serialNumber, specialMarks, hasProofOfOwnership, rewardAmount, imageUrl } = req.body;
  
  if (!reporterId || !name || !category || !color || !description || !lastSeenLocation || !dateLost) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const item = DB.createLostItem({
    reporterId,
    name,
    category: category as ItemCategory,
    brand,
    color,
    description,
    lastSeenLocation,
    dateLost,
    timeLost,
    serialNumber,
    specialMarks,
    hasProofOfOwnership: !!hasProofOfOwnership,
    rewardAmount: rewardAmount ? Number(rewardAmount) : undefined,
    imageUrl
  });

  // Automatically check matches for this new lost item
  const foundItems = DB.getFoundItems().filter(fi => fi.status === "ACTIVE");
  for (const found of foundItems) {
    let matchData = computeHeuristicMatch(item, found);
    
    // If we have AI, attempt to refine with AI for high heuristic scores
    if (ai && matchData && matchData.score >= 50) {
      try {
        const aiPrompt = `Compare this Lost Item and Found Item and output JSON.
        Lost Item: ${JSON.stringify(item)}
        Found Item: ${JSON.stringify(found)}
        Return JSON matching this schema:
        {
          "score": number (0-100),
          "confidenceLevel": "HIGH" | "MEDIUM" | "LOW",
          "matchedCriteria": string[]
        }`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: aiPrompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        if (aiResponse.text) {
          const parsed = JSON.parse(aiResponse.text.trim());
          if (parsed.score !== undefined) {
            matchData = {
              score: Number(parsed.score),
              confidenceLevel: parsed.confidenceLevel || "MEDIUM",
              matchedCriteria: parsed.matchedCriteria || []
            };
          }
        }
      } catch (err) {
        console.error("AI Matching refining failed, using heuristics:", err);
      }
    }

    if (matchData) {
      DB.createMatch({
        lostItemId: item.id,
        foundItemId: found.id,
        score: matchData.score,
        confidenceLevel: matchData.confidenceLevel,
        matchedCriteria: matchData.matchedCriteria,
        status: "PENDING"
      });

      // Dispatch alert notification to the lost item owner
      DB.createNotification(
        item.reporterId,
        "New Smart Match Detected!",
        `We found a ${matchData.score}% match for your lost "${item.name}" located at "${found.foundLocation}".`,
        "MATCH"
      );
    }
  }

  res.status(201).json({ item });
});

// Found Items API
app.get("/api/found-items", (req, res) => {
  res.json({ items: DB.getFoundItems() });
});

app.post("/api/found-items", async (req, res) => {
  const { reporterId, name, category, brand, color, description, foundLocation, dateFound, currentStorageLocation, imageUrl } = req.body;

  if (!reporterId || !name || !category || !color || !description || !foundLocation || !dateFound || !currentStorageLocation) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Generate automated tags using Gemini if possible
  let autoTags: string[] = [category, color];
  if (brand) autoTags.push(brand);

  if (ai) {
    try {
      const tagResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate exactly 5 brief, single-word tags (no hashtags) describing this found item: Name: "${name}", Description: "${description}", Category: "${category}". Output as JSON array of strings e.g. ["Tag1", "Tag2"].`,
        config: { responseMimeType: "application/json" }
      });
      if (tagResponse.text) {
        const parsed = JSON.parse(tagResponse.text.trim());
        if (Array.isArray(parsed)) {
          autoTags = parsed;
        }
      }
    } catch (err) {
      console.error("AI tagging failed, using defaults:", err);
    }
  }

  const item = DB.createFoundItem({
    reporterId,
    name,
    category: category as ItemCategory,
    brand,
    color,
    description,
    foundLocation,
    dateFound,
    currentStorageLocation,
    imageUrl,
    autoTags
  });

  // Award gamification points to the finder
  DB.updateUserPoints(reporterId, 25, "honest-finder");
  DB.createNotification(
    reporterId,
    "Points Awarded! 🪙",
    "You earned 25 Campus Helper points for reporting a found item. Thank you for making our campus safer!",
    "GAMIFICATION"
  );

  // Automatically check matches for this new found item
  const lostItems = DB.getLostItems().filter(li => li.status === "ACTIVE");
  for (const lost of lostItems) {
    let matchData = computeHeuristicMatch(lost, item);

    if (ai && matchData && matchData.score >= 50) {
      try {
        const aiPrompt = `Compare this Lost Item and Found Item and output JSON.
        Lost Item: ${JSON.stringify(lost)}
        Found Item: ${JSON.stringify(item)}
        Return JSON matching this schema:
        {
          "score": number (0-100),
          "confidenceLevel": "HIGH" | "MEDIUM" | "LOW",
          "matchedCriteria": string[]
        }`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: aiPrompt,
          config: { responseMimeType: "application/json" }
        });

        if (aiResponse.text) {
          const parsed = JSON.parse(aiResponse.text.trim());
          if (parsed.score !== undefined) {
            matchData = {
              score: Number(parsed.score),
              confidenceLevel: parsed.confidenceLevel || "MEDIUM",
              matchedCriteria: parsed.matchedCriteria || []
            };
          }
        }
      } catch (err) {
        console.error("AI Matching refining failed, using heuristics:", err);
      }
    }

    if (matchData) {
      DB.createMatch({
        lostItemId: lost.id,
        foundItemId: item.id,
        score: matchData.score,
        confidenceLevel: matchData.confidenceLevel,
        matchedCriteria: matchData.matchedCriteria,
        status: "PENDING"
      });

      // Dispatch alert notification to the lost item owner
      DB.createNotification(
        lost.reporterId,
        "New Potential Match! 🌟",
        `A found item "${item.name}" matches your lost item "${lost.name}" with a confidence score of ${matchData.score}%.`,
        "MATCH"
      );
    }
  }

  res.status(201).json({ item });
});

// Claims API
app.get("/api/claims", (req, res) => {
  res.json({ claims: DB.getClaims() });
});

app.post("/api/claims", (req, res) => {
  const { itemId, claimantId, studentId, ownershipProofDescription, ownershipProofFiles, secretIdentifier } = req.body;
  
  if (!itemId || !claimantId || !studentId || !ownershipProofDescription || !secretIdentifier) {
    return res.status(400).json({ error: "Missing required claim fields" });
  }

  // Simple fraud/risk assessment algorithm
  const claimsForThisUser = DB.getClaims().filter(c => c.claimantId === claimantId);
  const activeClaimsForThisUser = claimsForThisUser.filter(c => c.status !== "RECOVERED" && c.status !== "REJECTED");
  
  let riskScore = 5;
  const fraudFlags: string[] = [];

  if (activeClaimsForThisUser.length >= 3) {
    riskScore += 40;
    fraudFlags.push("User has 3+ concurrent active claims");
  }

  if (ownershipProofDescription.length < 15) {
    riskScore += 20;
    fraudFlags.push("Extremely short ownership description");
  }

  if (!secretIdentifier || secretIdentifier.trim().length < 5) {
    riskScore += 15;
    fraudFlags.push("Short secret identification detail");
  }

  // Create the claim
  const claim = DB.createClaim({
    itemId,
    itemType: "FOUND",
    claimantId,
    studentId,
    ownershipProofDescription,
    ownershipProofFiles: ownershipProofFiles || [],
    secretIdentifier,
    riskScore,
    fraudFlags
  });

  // Notify claimant
  DB.createNotification(
    claimantId,
    "Claim Submitted Successfully",
    "Your ownership claim has been submitted to the Security Office for review.",
    "CLAIM"
  );

  // Notify security office
  const securityUsers = DB.getUsers().filter(u => u.role === UserRole.SECURITY_OFFICE);
  securityUsers.forEach(s => {
    DB.createNotification(
      s.id,
      "New Claim Received 📋",
      `A new claim was submitted for found item ID: ${itemId} (Risk Level: ${riskScore >= 50 ? "HIGH" : "LOW"}).`,
      "CLAIM"
    );
  });

  res.status(201).json({ claim });
});

app.put("/api/claims/:id", (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  const claim = DB.getClaimById(id);
  if (!claim) {
    return res.status(404).json({ error: "Claim not found" });
  }

  const oldStatus = claim.status;
  DB.updateClaimStatus(id, status as ClaimStatus, adminNotes);

  // Update original items statuses on Recovered/Approved
  if (status === "RECOVERED") {
    const foundItem = DB.getFoundItemById(claim.itemId);
    if (foundItem) {
      DB.updateFoundItemStatus(foundItem.id, "CLAIMED");
      
      // Also update any matching active lost items to MATCHED or CLAIMED
      const matches = DB.getMatches().filter(m => m.foundItemId === foundItem.id);
      matches.forEach(m => {
        DB.updateMatchStatus(m.id, "APPROVED");
        DB.updateLostItemStatus(m.lostItemId, "CLAIMED");
      });
    }

    // Award extra gamification points to the claimant & helper
    DB.updateUserPoints(claim.claimantId, 20); // claimant point boost
  }

  // Dispatch custom status notification to claimant
  DB.createNotification(
    claim.claimantId,
    `Claim Status Updated: ${status}`,
    `Your claim for the item has moved from ${oldStatus} to ${status}. Notes: ${adminNotes || "None"}`,
    "CLAIM"
  );

  res.json({ message: "Claim updated successfully", claim: DB.getClaimById(id) });
});

// Chat API
app.get("/api/messages/:conversationId", (req, res) => {
  const { conversationId } = req.params;
  res.json({ messages: DB.getMessages(conversationId) });
});

app.post("/api/messages", (req, res) => {
  const { conversationId, senderId, senderName, senderRole, text, imageUrl } = req.body;

  if (!conversationId || !senderId || !senderName || !senderRole || !text) {
    return res.status(400).json({ error: "Missing required message parameters" });
  }

  const message = DB.createMessage({
    conversationId,
    senderId,
    senderName,
    senderRole: senderRole as UserRole,
    text,
    imageUrl
  });

  // Notify counterparts
  if (conversationId.startsWith("claim_")) {
    const claimId = conversationId.replace("claim_", "");
    const claim = DB.getClaimById(claimId);
    if (claim) {
      const recipientId = senderId === claim.claimantId ? "usr_security_dave" : claim.claimantId;
      DB.createNotification(
        recipientId,
        "New Message Received 💬",
        `${senderName} sent you a message regarding the pending claim.`,
        "CHAT"
      );
    }
  }

  res.status(201).json({ message });
});

// Notifications API
app.get("/api/notifications/:userId", (req, res) => {
  const { userId } = req.params;
  res.json({ notifications: DB.getNotifications(userId) });
});

app.post("/api/notifications/:userId/read", (req, res) => {
  const { userId } = req.params;
  DB.markNotificationsAsRead(userId);
  res.json({ success: true });
});

// Badges & Gamification Leaderboard
app.get("/api/gamification/badges", (req, res) => {
  res.json({ badges: DB.getBadges() });
});

app.get("/api/gamification/leaderboard", (req, res) => {
  const users = DB.getUsers();
  const sorted = [...users]
    .sort((a, b) => b.points - a.points)
    .map((u, i) => ({
      userId: u.id,
      name: u.name,
      department: u.department,
      role: u.role,
      points: u.points,
      badgesCount: u.badges.length,
      rank: i + 1
    }));
  res.json({ leaderboard: sorted });
});

// Enterprise Analytics Dashboard
app.get("/api/analytics/dashboard", (req, res) => {
  const users = DB.getUsers();
  const lost = DB.getLostItems();
  const found = DB.getFoundItems();
  const claims = DB.getClaims();

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.points > 10).length || totalUsers;
  const lostCount = lost.length;
  const foundCount = found.length;
  const pendingClaims = claims.filter(c => c.status !== "RECOVERED" && c.status !== "REJECTED").length;

  // Recovery Rate calculation
  const recoveredCount = claims.filter(c => c.status === "RECOVERED").length;
  const recoveryRate = foundCount > 0 ? Math.round((recoveredCount / foundCount) * 100) : 78; // High realistic default

  // Recovery Trends (last 6 months simulation)
  const trends = [
    { month: "Feb", lost: 15, recovered: 12 },
    { month: "Mar", lost: 24, recovered: 18 },
    { month: "Apr", lost: 32, recovered: 22 },
    { month: "May", lost: 19, recovered: 15 },
    { month: "Jun", lost: 28, recovered: 24 },
    { month: "Jul", lost: lostCount, recovered: recoveredCount }
  ];

  // Most commonly lost item categories
  const categories: Record<ItemCategory, number> = {
    ELECTRONICS: 0,
    BOOKS: 0,
    ID_CARDS: 0,
    WALLETS: 0,
    KEYS: 0,
    CLOTHING: 0,
    ACCESSORIES: 0,
    OTHERS: 0
  };

  lost.forEach(item => {
    if (categories[item.category] !== undefined) {
      categories[item.category]++;
    }
  });

  const categoryDistribution = Object.entries(categories).map(([name, count]) => ({
    name: name.replace("_", " "),
    count
  })).sort((a, b) => b.count - a.count);

  // Location heatmap statistics
  const locationsMap: Record<string, number> = {
    "Engineering Building Library": 12,
    "Central Fountain Plaza": 8,
    "Student Union Cafeteria": 15,
    "Science Laboratory Hall C": 4,
    "Campus Recreation Gym": 9,
    "Main Quad Parking Lot": 6
  };

  const highRiskZones = Object.entries(locationsMap).map(([zone, count]) => ({
    zone,
    incidentCount: count
  })).sort((a, b) => b.incidentCount - a.incidentCount);

  // Department recovery performance
  const departmentData: any[] = [
    { id: "dept1", name: "Computer Science", totalLost: 18, totalFound: 16, recoveryRate: 88 },
    { id: "dept2", name: "Mechanical Engineering", totalLost: 12, totalFound: 9, recoveryRate: 75 },
    { id: "dept3", name: "Physics", totalLost: 6, totalFound: 5, recoveryRate: 83 },
    { id: "dept4", name: "Business School", totalLost: 14, totalFound: 10, recoveryRate: 71 }
  ];

  res.json({
    kpis: {
      totalUsers,
      activeUsers,
      lostReports: lostCount,
      foundReports: foundCount,
      recoveryRate,
      pendingClaims
    },
    recoveryTrends: trends,
    categoryDistribution,
    highRiskZones,
    departmentAnalytics: departmentData
  });
});

// AI Assistant Endpoint
app.post("/api/ai/chat", async (req, res) => {
  const { message, chatHistory } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const systemInstruction = `You are "CampusConnect Lost & Found Assistant", an expert, empathetic, and professional guide helping users recover or report items at our university campus. 
  Answer user questions about:
  - How to submit a Lost Item report
  - How to submit a Found Item report
  - The security verification process (Claims Management workflow: Submitted -> Review -> Verification -> Approved -> Recovered)
  - Campus security storage rules (Items are held for up to 90 days before donation or disposal)
  - Fraud prevention policies (False claims result in disciplinary reviews)
  - Gamification (Helpers unlock points and Badges like "Honest Finder", "Campus Hero")
  Be extremely clear, concise, professional, and friendly. Avoid lengthy paragraphs where bullet points are better.`;

  if (ai) {
    try {
      // Reconstruct historical context for chats
      const contents = [];
      if (chatHistory && Array.isArray(chatHistory)) {
        chatHistory.slice(-6).forEach(ch => {
          contents.push({
            role: ch.sender === "user" ? "user" : "model",
            parts: [{ text: ch.text }]
          });
        });
      }
      contents.push({ role: "user", parts: [{ text: message }] });

      const chatResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction
        }
      });

      return res.json({ reply: chatResponse.text || "I apologize, I am processing high volumes. Please try again." });
    } catch (error) {
      console.error("AI Assistant execution error:", error);
    }
  }

  // Dual fallback expert conversational agent
  const fallbackReplies = [
    "I'd be glad to help you! To report a lost item, just head to your Dashboard and click 'Report Lost Item'. You can provide specific marks and locations.",
    "Found items reported are securely transferred to the Front Campus Security Office, row A or shelf 3. Be sure to check the map for popular find zones!",
    "Our Claim workflow goes from Submitted -> Review -> Verification -> Approved -> Recovered. For safety, we require valid Student IDs or receipt verification.",
    "Earn Points by logging found items! Unlocking 50 helper points grants you the 'Honest Finder' badge, visible on your public leaderboard profile.",
    "If you have any specific disputes, you can message our Security Office directly using our inline claims chat workspace.",
  ];

  const matchedReply = fallbackReplies.find(rep => 
    message.toLowerCase().includes("report") || 
    message.toLowerCase().includes("claim") || 
    message.toLowerCase().includes("point") ||
    message.toLowerCase().includes("badge") ||
    message.toLowerCase().includes("dispute")
  ) || "Welcome to CampusConnect! How can I assist you with your lost or found items, verification, or points today?";

  res.json({ reply: matchedReply });
});


// Vite middleware configuration (Development vs Production)
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then(vite => {
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`CampusConnect Server running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error("Failed to start Vite dev server:", err);
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CampusConnect Server running on http://localhost:${PORT}`);
  });
}
