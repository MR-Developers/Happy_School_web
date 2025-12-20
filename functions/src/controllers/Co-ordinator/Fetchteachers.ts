/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {Request, Response} from "express";
import admin from "../../config/firebase";

const db = admin.firestore();

export const fetchteachers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {wingId} = req.params;

  if (!wingId) {
    res.status(400).json({error: "Wing ID is required"});
    return;
  }

  try {
    // 1️⃣ Query all teacher userinfo docs by wingId
    const teachersSnap = await db
      .collectionGroup("userinfo")
      .where("role", "==", "teacher")
      .where("wingId", "==", wingId)
      .get();

    if (teachersSnap.empty) {
      res.status(404).json({
        error: "No teachers found for this wing",
      });
      return;
    }

    // 2️⃣ Build response
    const teachers = teachersSnap.docs.map((doc) => ({
      userId: doc.ref.parent.parent?.id, // Users/{userId}
      ...doc.data(),
    }));

    // 3️⃣ Response
    res.status(200).json({
      message: "Teachers fetched successfully",
      wingId,
      totalTeachers: teachers.length,
      teachers,
    });
  } catch (error: any) {
    console.error("Error fetching teachers:", error.message || error);
    res.status(500).json({error: "Internal server error"});
  }
};
