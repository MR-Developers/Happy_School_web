import { Request, Response } from "express";
import admin from "../config/firebaseAdmin";
import dotenv from "dotenv";

dotenv.config();

const db = admin.firestore();

export const getSchoolReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { schoolName } = req.params;

    if (!schoolName) {
      res.status(400).json({ error: "Missing required parameter: schoolName" });
      return;
    }

    console.log("Received schoolName:", schoolName);

    // ✅ Fetch the school by name
    const schoolSnapshot = await db
      .collection("Schools")
      .where("SchoolName", "==", schoolName)
      .get();

    if (schoolSnapshot.empty) {
      res.status(404).json({ error: "School not found" });
      return;
    }

    const schoolDoc = schoolSnapshot.docs[0];
    const schoolData = schoolDoc.data();

    console.log("Fetched school data:", schoolData);

    // ✅ Check if at least one report exists
    if (!schoolData.studentRefReport && !schoolData.teacherRefReport) {
      res.status(404).json({
        error: "No reports found for this school",
      });
      return;
    }

    // ✅ Prepare response only with available reports
    const responseData: {
      schoolId: string;
      schoolName: string;
      studentRefReport?: string;
      teacherRefReport?: string;
    } = {
      schoolId: schoolDoc.id,
      schoolName: schoolData.SchoolName,
    };

    if (schoolData.studentRefReport) {
      responseData.studentRefReport = schoolData.studentRefReport;
    }

    if (schoolData.teacherRefReport) {
      responseData.teacherRefReport = schoolData.teacherRefReport;
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching school reports:", error);
    res.status(500).json({
      error: "Internal server error while fetching school reports",
    });
  }
};
