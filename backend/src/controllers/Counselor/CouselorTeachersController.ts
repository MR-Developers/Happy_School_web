import { Request, Response } from "express";
import admin from "../../config/firebaseAdmin";
import dotenv from "dotenv";

dotenv.config();
const db = admin.firestore();

export const CounselorTeacherController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const email: string = req.params.email;

  try {
    // 1️⃣ Fetch counselor's user info
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

    const userData = userInfoSnap.data() as {
      school?: string;
      schools?: string[];
    };
    const schools =
      userData.schools || (userData.school ? [userData.school] : []);

    if (schools.length === 0) {
      res.status(404).json({ error: "No schools found for this counselor" });
      return;
    }

    // 2️⃣ Fetch teachers from all schools
    const allTeachers: any[] = [];

    for (const school of schools) {
      const teachersSnap = await db
        .collection("SchoolUsers")
        .doc(school)
        .collection("Users")
        .get();

      const teacherIds = teachersSnap.docs.map((doc) => doc.id);

      // Fetch teacher info for each teacher
      const teacherData = await Promise.all(
        teacherIds.map(async (id) => {
          const docSnap = await db
            .collection("Users")
            .doc(id)
            .collection("userinfo")
            .doc("userinfo")
            .get();

          if (docSnap.exists) {
            return {
              id,
              school,
              ...docSnap.data(),
            };
          }
          return null;
        })
      );

      allTeachers.push(...teacherData.filter(Boolean));
    }

    if (allTeachers.length === 0) {
      res
        .status(404)
        .json({ error: "No teachers found across assigned schools" });
      return;
    }

    // 3️⃣ Send response
    res.status(200).json({
      message: "Teachers fetched successfully",
      totalTeachers: allTeachers.length,
      schoolsCount: schools.length,
      teachers: allTeachers,
    });
  } catch (e: any) {
    console.error("Error in CounselorTeacherController:", e.message || e);
    res.status(500).json({ error: "Internal server error" });
  }
};
