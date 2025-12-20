/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */

import {Request, Response} from "express";
import admin from "../../config/firebase";

const db = admin.firestore();


export const getcoordinatordashboardsummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {wingId} = req.params;

  if (!wingId) {
    res.status(400).json({error: "wingId is required"});
    return;
  }

  try {
    /**
     * 1️⃣ Fetch teachers for this wing
     */
    const teacherSnap = await db
      .collectionGroup("userinfo")
      .where("role", "==", "teacher")
      .where("wingId", "==", wingId)
      .get();

    if (teacherSnap.empty) {
      res.status(200).json({
        message: "No teachers found for this wing",
        stats: {
          totalTeachers: 0,
          totalTickets: 0,
          earlyAdopterCount: 0,
          totalSessions: 0,
          postCount: 0,
          taskCount: 0,
        },
        teachers: [],
        teacherTickets: [],
      });
      return;
    }

    const teachers: any[] = [];
    const teacherEmails: string[] = [];
    let school: string | undefined;

    teacherSnap.forEach((doc) => {
      const data = doc.data();
      const teacherEmail = doc.ref.parent.parent?.id;

      if (!school && data.school) {
        school = data.school;
      }

      if (teacherEmail) {
        teacherEmails.push(teacherEmail.toLowerCase());
      }

      teachers.push({
        id: teacherEmail,
        ...data,
      });
    });

    if (!school) {
      res.status(404).json({error: "School not found for wing teachers"});
      return;
    }

    /**
     * 2️⃣ Fetch tickets for this school
     */
    const ticketsRef = db.collection("Tickets").doc(school).collection(school);
    const allTicketsSnap = await ticketsRef.get();

    let totalSessionsValue = 0;
    let earlyAdopterCount = 0;
    const teacherTickets: any[] = [];

    allTicketsSnap.forEach((doc) => {
      const data = doc.data();

      // Sum one-on-one sessions
      if (typeof data.oneononesessions === "number") {
        totalSessionsValue += data.oneononesessions;
      }

      // Early adopter count
      if (data.category === "Early Adopter") {
        earlyAdopterCount++;
      }

      // Tickets belonging to wing teachers
      if (
        data.email &&
        teacherEmails.includes(String(data.email).toLowerCase())
      ) {
        teacherTickets.push({
          id: doc.id,
          ...data,
        });
      }
    });

    /**
     * 3️⃣ Fetch school-level stats
     */
    const schoolSnap = await db
      .collection("Schools")
      .where("SchoolName", "==", school)
      .limit(1)
      .get();

    const schoolData = schoolSnap.empty ? {} : schoolSnap.docs[0].data();

    /**
     * 4️⃣ Final response
     */
    res.status(200).json({
      message: "Coordinator dashboard summary fetched successfully",
      wingId,
      school,
      stats: {
        totalTeachers: teachers.length,
        totalTickets: teacherTickets.length,
        earlyAdopterCount,
        totalSessions: totalSessionsValue,
        postCount: schoolData?.Posts ?? 0,
        taskCount: schoolData?.Tasks ?? 0,
      },
      teachers,
      teacherTickets,
    });
  } catch (error: any) {
    console.error(
      "Error in getCoordinatorDashboardSummary:",
      error.message || error
    );
    res.status(500).json({error: "Internal server error"});
  }
};
