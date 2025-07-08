import { Request, Response } from "express";
import admin from "../config/firebase";


const db = admin.firestore();

export const getdashboardsummary = async (req: Request, res: Response): Promise<void> => {
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
    const postsSnap = await db.collection("Posts").doc(school).collection("Posts").get();
    const postCount = postsSnap.size;

    // Step 3: Count Announcements
    const announcementsSnap = await db
      .collection("Announcements")
      .doc(school)
      .collection("Announcements")
      .get();
    const announcementCount = announcementsSnap.size;

    // Step 4: Count Challenges
    const challengeSnap = await db
      .collection("Content")
      .doc("Content")
      .collection(school)
      .doc(school)
      .collection("ChallengeNames")
      .get();
    const challengeCount = challengeSnap.size;

    // Respond
    res.status(200).json({
      school,
      postCount,
      announcementCount,
      challengeCount,
    });
  } catch (error: any) {
    console.error("Error in getDashboardSummary:", error.message || error);
    res.status(500).json({ error: "Internal server error" });
  }
};
