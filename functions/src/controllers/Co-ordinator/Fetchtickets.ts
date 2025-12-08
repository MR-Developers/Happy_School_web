/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {Request, Response} from "express";
import admin from "../../config/firebase";

const db = admin.firestore();

export const fetchtickets = async (req: Request, res: Response): Promise<void> => {
  const email: string = req.params.email;
  const {teacher, status, fromDate, toDate, category} = req.query;

  if (!email) {
    res.status(400).json({error: "Coordinator email is required"});
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
      res.status(404).json({error: "Coordinator not found in Firestore"});
      return;
    }

    const school = coordinatorSnap.data()?.school;
    if (!school) {
      res.status(404).json({error: "School not found for this coordinator"});
      return;
    }

    // 2️⃣ Fetch all tickets for the coordinator’s school
    const ticketQuerySnap = await db
      .collection("Tickets")
      .doc(school)
      .collection(school)
      .get();

    let tickets = ticketQuerySnap.docs.map((doc) => ({
      id: doc.id,
      school,
      ...doc.data(),
    }));

    // 3️⃣ Apply filters (same as in CounselorTicketController)
    if (teacher) {
      tickets = tickets.filter(
        (t) => (t as any).email?.toLowerCase() === String(teacher).toLowerCase()
      );
    }

    if (status) {
      tickets = tickets.filter(
        (t) => (t as any).status?.toLowerCase() === String(status).toLowerCase()
      );
    }

    if (category) {
      tickets = tickets.filter(
        (t) =>
          (t as any).category?.toLowerCase() === String(category).toLowerCase()
      );
    }

    if (fromDate || toDate) {
      tickets = tickets.filter((t) => {
        const timeStr = (t as any).timestamp;
        if (!timeStr) return false;

        const time = new Date(timeStr).getTime();
        const from = fromDate ? new Date(String(fromDate)).getTime() : -Infinity;
        const to = toDate ? new Date(String(toDate)).getTime() : Infinity;

        return time >= from && time <= to;
      });
    }

    // 4️⃣ Send response
    res.status(200).json({
      message: "Tickets fetched successfully",
      totalTickets: tickets.length,
      school,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({error: "Internal server error"});
  }
};
