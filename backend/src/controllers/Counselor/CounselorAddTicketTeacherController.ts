import { Request, Response } from "express";
import admin from "../../config/firebaseAdmin";
import dotenv from "dotenv";

dotenv.config();

const db = admin.firestore();

export const CounselorAddTicketTeacherController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const school: string = req.params.school;

  try {
    if (!school) {
      console.error("school not found");
      res.status(404).json({ error: "school not found" });
      return;
    }

    // Get all teacher document IDs
    const techSnapshot = await db
      .collection("SchoolUsers")
      .doc(school)
      .collection("Users")
      .get();

    const teacherIds: string[] = techSnapshot.docs.map((doc) => doc.id);

    if (teacherIds.length === 0) {
      res.status(404).json({ error: "No teachers found" });
      return;
    }

    // Fetch userinfo for each teacher
    const teacherData = await Promise.all(
      teacherIds.map(async (id) => {
        const docRef = db
          .collection("Users")
          .doc(id)
          .collection("userinfo")
          .doc("userinfo");

        const docSnap = await docRef.get();

        if (docSnap.exists) {
          return {
            id,
            ...docSnap.data(),
          };
        } else {
          return null;
        }
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
