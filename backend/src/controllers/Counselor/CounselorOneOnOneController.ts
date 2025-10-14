import { Request, Response } from "express";
import admin from "../../config/firebaseAdmin";
import dotenv from "dotenv";

dotenv.config();
const db = admin.firestore();

export const OneOnOneController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const email: string = req.params.email;
  const { teacher, status, fromDate, toDate, category } = req.query;

  try {
    // 1️⃣ Get user's schools
    const userInfoSnap = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

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

    if (!schools || schools.length === 0) {
      res.status(404).json({ error: "No schools found for this user" });
      return;
    }

    // 2️⃣ Fetch tickets for each school in parallel
    const results = await Promise.allSettled(
      schools.map(async (school) => {
        const ticketSubColRef = db
          .collection("Tickets")
          .doc(school)
          .collection(school);

        const ticketsSnap = await ticketSubColRef.get();

        let tickets = ticketsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // ✅ Filter: only tickets with oneononesessions > 0
        tickets = tickets.filter(
          (t) => (t as any).oneononesessions && (t as any).oneononesessions > 0
        );

        // Apply filters (teacher, status, category, date range)
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

            const from = fromDate
              ? new Date(String(fromDate)).getTime()
              : -Infinity;
            const to = toDate ? new Date(String(toDate)).getTime() : Infinity;

            return time >= from && time <= to;
          });
        }

        return {
          school,
          ticketCount: tickets.length,
          tickets,
        };
      })
    );

    // 3️⃣ Process results
    const successful: any[] = [];
    const failed: any[] = [];

    results.forEach((result, index) => {
      const school = schools[index];
      if (result.status === "fulfilled") {
        successful.push(result.value);
      } else {
        failed.push({
          school,
          reason:
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason),
        });
      }
    });

    // 4️⃣ Handle responses
    if (successful.length === 0) {
      res.status(404).json({
        error: "No data found for any school",
        failed,
      });
      return;
    }

    res.status(200).json({
      message: "One-on-one tickets fetched (partial if some failed)",
      totalSchoolsRequested: schools.length,
      totalWithData: successful.length,
      failedCount: failed.length,
      failedSchools: failed,
      data: successful,
    });
  } catch (e: any) {
    console.error("Error in OneOnOneController:", e.message || e);
    res.status(500).json({ error: "Internal server error" });
  }
};
