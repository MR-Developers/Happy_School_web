// functions/src/controllers/teacherController.ts

import { Request, Response } from "express";
import admin from "../config/firebase";

const db = admin.firestore();

export const teacher = async (req: Request, res: Response): Promise<void> => {
  const email: string = req.params.email;

  try {
    const snapshot = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (!snapshot.exists) {
      res.status(404).json({ error: "User info not found in Firestore" });
      return;
    }

    const userData = snapshot.data() as { school?: string };
    const school = userData.school;

    if (!school) {
      console.error("school not found");
      res.status(404).json({ error: "school not found" });
      return;
    }

    const techSnapshot = await db
      .collection("SchoolUsers")
      .doc(school)
      .collection("Users")
      .get();

    const teacherIds: string[] = techSnapshot.docs.map(doc => doc.id);

    if (teacherIds.length === 0) {
      res.status(404).json({ error: "No teachers found" });
      return;
    }

    const teacherData = await Promise.all(
      teacherIds.map(async (id) => {
        const docRef = db
          .collection("Users")
          .doc(id)
          .collection("userinfo")
          .doc("userinfo");

        const docSnap = await docRef.get();

        return docSnap.exists ? { id, ...docSnap.data() } : null;
      })
    );

    const filteredTeacherData = teacherData.filter(Boolean);

    res.status(200).json({
      message: "Teachers fetched successfully",
      teachers: filteredTeacherData,
      noOfTechers: filteredTeacherData.length,
    });

  } catch (e: any) {
    console.error("Error in fetching teachers:", e.message);
    res.status(500).json({ error: "Server error" });
  }
};
