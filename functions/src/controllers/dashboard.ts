/* eslint-disable @typescript-eslint/no-explicit-any */
import {Request, Response} from "express";
import admin from "../config/firebase";
/* eslint-disable max-len */


const db = admin.firestore();

export const getdashboardsummary = async (req: Request, res: Response): Promise<void> => {
  const email = req.params.email;

  try {
    // Step 1: Fetch user school info
    const userDocSnap = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (!userDocSnap.exists) {
      res.status(404).json({error: "User info not found in Firestore"});
      return;
    }

    const school = userDocSnap.data()?.school;
    if (!school) {
      res.status(404).json({error: "School not found"});
      return;
    }

    const ticketsRef = db.collection("Tickets").doc(school).collection(school);
    const schoolQueryRef = db
      .collection("Schools")
      .where("SchoolName", "==", school)
      .limit(1);

    // Step 2: Parallel Firestore queries
    const [meetingCountSnap, earlyAdopterCountSnap, schoolSnapshot] =
      await Promise.all([
        ticketsRef.where("status", "==", "Meeting").count().get(),
        ticketsRef.where("category", "==", "Early Adopter").count().get(),
        schoolQueryRef.get(),
      ]);

    if (schoolSnapshot.empty) {
      res.status(404).json({error: "School not found in Schools collection"});
      return;
    }

    const schoolData = schoolSnapshot.docs[0].data();

    // Step 3: Return combined summary
    res.status(200).json({
      school,
      postCount: schoolData.Posts ?? 0,
      meetingTicketCount: meetingCountSnap.data().count,
      earlyAdopterCount: earlyAdopterCountSnap.data().count,
      taskscount: schoolData.Tasks ?? 0,
    });
  } catch (error: any) {
    console.error("Error in getDashboardSummary:", error.message || error);
    res.status(500).json({error: "Internal server error"});
  }
};
