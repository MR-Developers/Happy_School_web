/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {Request, Response} from "express";
import admin from "../../config/firebase";

const db = admin.firestore();

export const fetchtickets = async (req: Request, res: Response): Promise<void> => {
  const {wingId} = req.params;
  const {teacher, status, fromDate, toDate, category} = req.query;

  if (!wingId) {
    res.status(400).json({error: "Wing ID is required"});
    return;
  }

  try {
    // 1️⃣ Verify wing & get school
    const wingSnap = await db.collection("Wings").doc(wingId).get();

    if (!wingSnap.exists) {
      res.status(404).json({error: "Wing not found"});
      return;
    }

    const school = wingSnap.data()?.schoolName;

    if (!school) {
      res.status(404).json({error: "School not found for this wing"});
      return;
    }

    // 2️⃣ Fetch teachers & coordinators of this wing
    const teachersSnap = await db
      .collectionGroup("userinfo")
      .where("wingId", "==", wingId)
      .where("role", "==", "teacher")
      .get();

    const coordinatorsSnap = await db
      .collectionGroup("userinfo")
      .where("wingId", "==", wingId)
      .where("role", "==", "co-ordinator")
      .get();

    // 3️⃣ Collect emails
    const allowedEmails = new Set<string>();

    teachersSnap.docs.forEach((doc) => {
      const email = doc.data().email;
      if (email) allowedEmails.add(email.toLowerCase());
    });

    coordinatorsSnap.docs.forEach((doc) => {
      const email = doc.data().email;
      if (email) allowedEmails.add(email.toLowerCase());
    });

    // 4️⃣ Fetch tickets for school
    const ticketQuerySnap = await db
      .collection("Tickets")
      .doc(school)
      .collection(school)
      .where("privacy", "==", false)
      .get();

    let tickets = ticketQuerySnap.docs
      .map((doc) => ({
        id: doc.id,
        school,
        ...doc.data(),
      }))
      // ✅ Match ticket email with teacher/coordinator emails
      .filter((t: any) =>
        t.email && allowedEmails.has(t.email.toLowerCase())
      );

    // 5️⃣ Optional filters
    if (teacher) {
      tickets = tickets.filter(
        (t: any) =>
          t.email?.toLowerCase() === String(teacher).toLowerCase()
      );
    }

    if (status) {
      tickets = tickets.filter(
        (t: any) =>
          t.status?.toLowerCase() === String(status).toLowerCase()
      );
    }

    if (category) {
      tickets = tickets.filter(
        (t: any) =>
          t.category?.toLowerCase() === String(category).toLowerCase()
      );
    }

    if (fromDate || toDate) {
      tickets = tickets.filter((t: any) => {
        if (!t.timestamp) return false;

        const time = new Date(t.timestamp).getTime();
        const from = fromDate ? new Date(String(fromDate)).getTime() : -Infinity;
        const to = toDate ? new Date(String(toDate)).getTime() : Infinity;

        return time >= from && time <= to;
      });
    }

    // 6️⃣ Response
    res.status(200).json({
      message: "Tickets fetched successfully",
      wingId,
      school,
      totalTickets: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({error: "Internal server error"});
  }
};
