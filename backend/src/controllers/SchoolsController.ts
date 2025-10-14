import { Request, Response } from "express";
import admin from "../config/firebaseAdmin";
import dotenv from "dotenv";

dotenv.config();
const db = admin.firestore();

export const getAllSchools = async (req: Request, res: Response) => {
  try {
    // Fetch all documents in the "schools" collection
    const schoolsSnap = await db.collection("Schools").get();

    if (schoolsSnap.empty) {
      res.status(404).json({ error: "No schools found" });
      return;
    }
    const schools = schoolsSnap.docs
      .map((doc) => {
        const data = doc.data();
        if (data.SchoolName) {
          return { name: data.SchoolName };
        }
        return null;
      })
      .filter(Boolean);

    res.status(200).json({
      message: "Schools fetched successfully",
      schools,
      totalSchools: schools.length,
    });
  } catch (error: any) {
    console.error("Error fetching schools:", error.message || error);
    res.status(500).json({ error: "Internal server error" });
  }
};
