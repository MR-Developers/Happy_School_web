import { Request, Response } from "express";
import admin from "../../config/firebaseAdmin";
import dotenv from "dotenv";

dotenv.config();

const db = admin.firestore();

export const getCounselorSchoolReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.params;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  try {
    // 1️⃣ Get user info to find assigned schools
    const userInfoSnap = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();
    console.log(email);
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
      res.status(404).json({ error: "No schools found for this user" });
      return;
    }

    // 2️⃣ Fetch reports for all schools
    const allReports = await Promise.all(
      schools.map(async (schoolName) => {
        // Query the school in Schools collection
        const schoolSnap = await db
          .collection("Schools")
          .where("SchoolName", "==", schoolName)
          .limit(1)
          .get();

        if (schoolSnap.empty) {
          // School not found, skip it
          return null;
        }

        const schoolDoc = schoolSnap.docs[0];
        const data = schoolDoc.data();

        return {
          schoolId: schoolDoc.id,
          schoolName: data.SchoolName,
          studentRefReport: data.studentRefReport || null,
          teacherRefReport: data.teacherRefReport || null,
        };
      })
    );

    // 3️⃣ Filter out nulls (schools not found)
    const validReports = allReports.filter(Boolean);

    if (validReports.length === 0) {
      res
        .status(404)
        .json({ error: "No reports found for any assigned schools" });
      return;
    }

    // 4️⃣ Return response
    res.status(200).json({
      message: "School reports fetched successfully",
      totalSchools: schools.length,
      totalWithReports: validReports.length,
      data: validReports,
    });
  } catch (error: any) {
    console.error("Error fetching school reports:", error.message || error);
    res.status(500).json({ error: "Internal server error" });
  }
};
