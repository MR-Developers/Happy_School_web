import { Request, Response } from "express";
import admin from "../../config/firebaseAdmin";
import dotenv from "dotenv";

dotenv.config();
const db = admin.firestore();

export const getCoordinatorDashboardSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  const email = req.params.email;

  if (!email) {
    res.status(400).json({ error: "Coordinator email is required" });
    return;
  }

  try {
    // 1️⃣ Verify coordinator exists and get school
    const coordinatorSnap = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (!coordinatorSnap.exists) {
      res.status(404).json({ error: "Coordinator not found in Firestore" });
      return;
    }

    const coordinatorData = coordinatorSnap.data();
    const school = coordinatorData?.school;

    if (!school) {
      res.status(404).json({ error: "School not found for this coordinator" });
      return;
    }

    // 2️⃣ Fetch all teachers under this coordinator
    const teacherQuerySnap = await db
      .collectionGroup("userinfo")
      .where("coordinator", "==", email)
      .where("role", "==", "teacher")
      .get();

    const teachers: any[] = [];
    teacherQuerySnap.forEach((doc) => {
      teachers.push({
        id: doc.ref.parent.parent?.id, // teacher's document ID (email)
        ...doc.data(),
      });
    });

    // 3️⃣ Fetch all tickets for this school
    const ticketsRef = db.collection("Tickets").doc(school).collection(school);
    const [earlyAdopterCountSnap, allTicketsSnap] = await Promise.all([
      ticketsRef.where("category", "==", "Early Adopter").count().get(),
      ticketsRef.get(),
    ]);

    // 4️⃣ Calculate total one-on-one sessions and filter tickets related to these teachers
    let totalSessionsValue = 0;
    const teacherEmails = teachers.map((t) => t.email?.toLowerCase());
    const teacherTickets: any[] = [];

    allTicketsSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.oneononesessions && typeof data.oneononesessions === "number") {
        totalSessionsValue += data.oneononesessions;
      }

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

    // 5️⃣ Get school data from Schools collection (like in dashboard summary)
    const schoolQueryRef = db
      .collection("Schools")
      .where("SchoolName", "==", school)
      .limit(1);

    const schoolSnapshot = await schoolQueryRef.get();
    if (schoolSnapshot.empty) {
      res.status(404).json({ error: "School not found in Schools collection" });
      return;
    }

    const schoolData = schoolSnapshot.docs[0].data();

    // 6️⃣ Final response
    res.status(200).json({
      message: "Coordinator dashboard summary fetched successfully",
      coordinator: {
        email,
        school,
      },
      stats: {
        totalTeachers: teachers.length,
        totalTickets: allTicketsSnap.size,
        earlyAdopterCount: earlyAdopterCountSnap.data().count,
        totalSessions: totalSessionsValue,
        postCount: schoolData.Posts ?? 0,
        taskCount: schoolData.Tasks ?? 0,
      },
      teachers,
      teacherTickets,
    });
  } catch (error: any) {
    console.error("Error in getCoordinatorDashboardSummary:", error.message || error);
    res.status(500).json({ error: "Internal server error" });
  }
};
