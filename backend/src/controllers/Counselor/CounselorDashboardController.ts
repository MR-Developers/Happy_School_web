import { Request, Response } from "express";
import admin from "../../config/firebaseAdmin";
import dotenv from "dotenv";

dotenv.config();
const db = admin.firestore();

export const getCounselorDashboardSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  const email = req.params.email;

  try {
    const userDocSnap = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (!userDocSnap.exists) {
      res.status(404).json({ error: "User info not found in Firestore" });
      return;
    }

    const schools: string[] = userDocSnap.data()?.schools;
    if (!schools || !Array.isArray(schools) || schools.length === 0) {
      res.status(404).json({ error: "No schools found" });
      return;
    }
    const results = await Promise.all(
      schools.map(async (school) => {
        const ticketsRef = db
          .collection("Tickets")
          .doc(school)
          .collection(school);
        const schoolQueryRef = db
          .collection("Schools")
          .where("SchoolName", "==", school)
          .limit(1);

        const [earlyAdopterCountSnap, schoolSnapshot, allTicketsSnap] =
          await Promise.all([
            ticketsRef.where("category", "==", "Early Adopter").count().get(),
            schoolQueryRef.get(),
            ticketsRef.get(),
          ]);

        if (schoolSnapshot.empty) {
          return null;
        }

        const schoolData = schoolSnapshot.docs[0].data();

        let totalSessionsValue = 0;
        allTicketsSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (
            data.oneononesessions &&
            typeof data.oneononesessions === "number"
          ) {
            totalSessionsValue += data.oneononesessions;
          }
        });

        return {
          school,
          postCount: schoolData.Posts ?? 0,
          meetingTicketCount: totalSessionsValue,
          earlyAdopterCount: earlyAdopterCountSnap.data().count,
          taskscount: schoolData.Tasks ?? 0,
          sessions: totalSessionsValue,
        };
      })
    );

    const validResults = results.filter((r) => r !== null) as any[];

    if (validResults.length === 0) {
      res.status(404).json({ error: "No valid schools found" });
      return;
    }

    const totalSummary = validResults.reduce(
      (acc, cur) => {
        acc.postCount += cur.postCount;
        acc.meetingTicketCount += cur.meetingTicketCount;
        acc.earlyAdopterCount += cur.earlyAdopterCount;
        acc.taskscount += cur.taskscount;
        acc.sessions += cur.sessions;
        acc.schools.push(cur.school);
        return acc;
      },
      {
        postCount: 0,
        meetingTicketCount: 0,
        earlyAdopterCount: 0,
        taskscount: 0,
        sessions: 0,
        schools: [] as string[],
      }
    );
    res.status(200).json(totalSummary);
  } catch (error: any) {
    console.error("Error in getDashboardSummary:", error.message || error);
    res.status(500).json({ error: "Internal server error" });
  }
};
