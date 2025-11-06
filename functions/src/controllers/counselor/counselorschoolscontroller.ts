/* eslint-disable @typescript-eslint/no-explicit-any */
import {Request, Response} from "express";
import admin from "../../config/firebase";
const db = admin.firestore();

export const getallschools = async (req: Request, res: Response) => {
  const email: string = req.params.email;

  try {
    // Fetch user info
    const userInfoSnap = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (!userInfoSnap.exists) {
      res.status(404).json({error: "User info not found in Firestore"});
      return;
    }

    const userData = userInfoSnap.data() as {
      school?: string;
      schools?: string[];
    };

    if (!userData.schools || userData.schools.length === 0) {
      res.status(404).json({error: "No schools assigned to this user"});
      return;
    }

    const schoolsQuery = await db
      .collection("Schools")
      .where("SchoolName", "in", userData.schools)
      .get();

    if (schoolsQuery.empty) {
      res.status(404).json({error: "No matching schools found"});
      return;
    }

    const schools = schoolsQuery.docs.map((doc) => ({
      name: doc.data().SchoolName,
    }));

    res.status(200).json({
      message: "Schools fetched successfully",
      schools,
      totalSchools: schools.length,
    });
  } catch (error: any) {
    console.error("Error fetching schools:", error.message || error);
    res.status(500).json({error: "Internal server error"});
  }
};
