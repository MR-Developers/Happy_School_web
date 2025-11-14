import { Request, Response } from "express";
import admin from "../../config/firebaseAdmin";

const db = admin.firestore();

export const FetchTeachers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.params;

  if (!email) {
    res.status(400).json({ error: "Coordinator email is required" });
    return;
  }

  try {
    // 1️⃣ Verify that this coordinator exists
    const coordinatorSnap = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (!coordinatorSnap.exists) {
      res
        .status(404)
        .json({ error: "Coordinator not found in Firestore" });
      return;
    }

    // 2️⃣ Query all teachers whose coordinator matches this email
    const teacherQuerySnap = await db
      .collectionGroup("userinfo")
      .where("coordinator", "==", email)
      .where("role", "==", "teacher")
      .get();

    if (teacherQuerySnap.empty) {
      res
        .status(404)
        .json({ error: "No teachers found for the given coordinator" });
      return;
    }

    // 3️⃣ Collect teacher info
    const teachers: any[] = [];
    teacherQuerySnap.forEach((doc) => {
      teachers.push({
        id: doc.ref.parent.parent?.id, // teacher's user doc ID (email)
        ...doc.data(),
      });
    });

    // 4️⃣ Send response
    res.status(200).json({
      message: "Teachers fetched successfully",
      totalTeachers: teachers.length,
      teachers,
    });
  } catch (error: any) {
    console.error("Error fetching teachers:", error.message || error);
    res.status(500).json({ error: "Internal server error" });
  }
};
