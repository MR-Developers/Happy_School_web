import { Request, Response } from "express";
import admin from "../config/firebaseAdmin";
import dotenv from "dotenv";

dotenv.config();
const db = admin.firestore();

export const getDashboardSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  const email = req.params.email;

  try {
    // Step 1: Get user's school from Users collection
    const userInfoSnap = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (!userInfoSnap.exists) {
      res.status(404).json({ error: "User info not found in Firestore" });
      return;
    }

    const userData = userInfoSnap.data() as { school?: string };
    const school = userData?.school;

    if (!school) {
      res.status(404).json({ error: "School not found" });
      return;
    }

    // Step 2: Count Posts
    const postsSnap = await db
      .collection("Posts")
      .doc(school)
      .collection("Posts")
      .get();
    const postCount = postsSnap.size;

    // Step 4: Count Challenges
    const challengeSnap = await db
      .collection("Content")
      .doc("Content")
      .collection(school)
      .doc(school)
      .collection("ChallengeNames")
      .get();
    const challengeCount = challengeSnap.size;

    // Step 5: Count Tickets with Status == "Meeting"
    const ticketsSnap = await db
      .collection("Tickets")
      .doc(school)
      .collection(school)
      .where("status", "==", "Meeting")
      .get();
    const meetingTicketCount = ticketsSnap.size;
    const EarlyAdopterSnap = await db
      .collection("Tickets")
      .doc(school)
      .collection(school)
      .where("category", "==", "Early Adopter")
      .get();
    const earlyAdopterCount = EarlyAdopterSnap.size;
    // Final Response
    res.status(200).json({
      school,
      postCount,
      challengeCount,
      meetingTicketCount,
      earlyAdopterCount,
    });
  } catch (error: any) {
    console.error("Error in getDashboardSummary:", error.message || error);
    res.status(500).json({ error: "Internal server error" });
  }
};
