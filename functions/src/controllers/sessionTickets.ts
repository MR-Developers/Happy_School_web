// functions/src/routes/ticketRoutes.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
// eslint-disable-next-line new-cap
import {Router, Request, Response} from "express";
import {db} from "../config/firebase";
// eslint-disable-next-line new-cap
const router = Router();


router.get("/all-tickets/:email", async (req: Request, res: Response) => {
  const email: string = req.params.email;
  const {teacher, status, fromDate, toDate, category} = req.query;

  try {
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

    const userData = userInfoSnap.data() as { school?: string };
    const school = userData?.school;

    if (!school) {
      res.status(404).json({error: "School not found"});
      return;
    }

    const ticketSubColRef = db
      .collection("Tickets")
      .doc(school)
      .collection(school);

    const ticketsSnap = await ticketSubColRef.get();

    let tickets = ticketsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (teacher) {
      tickets = tickets.filter(
        (t) =>
          (t as any).email?.toLowerCase() === String(teacher).toLowerCase()
      );
    }

    if (status) {
      tickets = tickets.filter(
        (t) =>
          (t as any).status?.toLowerCase() === String(status).toLowerCase()
      );
    }

    if (category) {
      tickets = tickets.filter(
        (t) =>
          (t as any).category?.toLowerCase() ===
          String(category).toLowerCase()
      );
    }

    if (fromDate || toDate) {
      tickets = tickets.filter((t) => {
        const timeStr = (t as any).timestamp;
        const time = new Date(timeStr).getTime();

        const from = fromDate ?
          new Date(String(fromDate)).getTime() :
          -Infinity;
        const to = toDate ? new Date(String(toDate)).getTime() : Infinity;

        return time >= from && time <= to;
      });
    }

    res.status(200).json({
      message: "Tickets fetched successfully",
      ticketCount: tickets.length,
      tickets,
    });
  } catch (e: any) {
    console.error("Error in TicketController:", e.message || e);
    res.status(500).json({error: "Internal server error"});
  }
});

export default router;
