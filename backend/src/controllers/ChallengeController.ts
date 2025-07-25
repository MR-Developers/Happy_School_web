import { Request, Response } from "express";
import admin from "../config/firebaseAdmin"; // Firebase Admin initialized
import dotenv from "dotenv";

dotenv.config();

const db = admin.firestore();

export const getChallengesBySchool = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { school } = req.params;

  if (!school) {
    res.status(400).json({ error: "School name is required" });
    return;
  }

  try {
    const docRef = db
      .collection("Content")
      .doc("Content")
      .collection(school)
      .doc(school)
      .collection("ChallengeNames")
      .doc("ChallengeNames");
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      res.status(404).json({ error: "No challenges found for the school" });
      return;
    }

    const challengeData = docSnap.data();

    res.status(200).json({
      message: "Challenges fetched successfully",
      school,
      challenges: challengeData,
    });
  } catch (error: any) {
    console.error("Error fetching challenges:", error.message);
    res.status(500).json({ error: "Failed to retrieve challenges" });
  }
};
