/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */

import {Request, Response} from "express";
import {db} from "../config/firebase";

// Define interfaces based on actual response data
interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface Contributor {
  name: string;
  email: string;
}

interface TeacherObject {
  name: string;
  email: string;
}

interface Ticket {
  id: string;
  oneononesessions: number;
  tocken: number;
  uid?: string;
  ticketText: string;
  school: string;
  userName: string;
  email: string;
  timestamp: FirestoreTimestamp;
  status: string;
  contributors?: Contributor[];
  category?: string;
  teacher?: TeacherObject | string; // Can be either object or string
  reply?: string;
  meetinglink?: string;
  [key: string]: unknown; // For any additional properties
}

interface UserData {
  school?: string;
  [key: string]: unknown;
}

export const oneononecontroller = async (
  req: Request,
  res: Response
): Promise<void> => {
  const email: string = req.params.email;
  const {teacher, status, fromDate, toDate, category} = req.query;

  try {
    // 1) Get the requesting user's school
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

    const userData = userInfoSnap.data() as UserData;
    const school = userData?.school;

    if (!school) {
      res.status(404).json({error: "School not found"});
      return;
    }

    // 2) Get the tickets
    const ticketSubColRef = db
      .collection("Tickets")
      .doc(school)
      .collection(school);
    const ticketsSnap = await ticketSubColRef.get();

    let tickets: Ticket[] = ticketsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Ticket[];

    // ✅ Extra condition: only tickets with oneononesessions > 0
    tickets = tickets.filter(
      (t) => t.oneononesessions && t.oneononesessions > 0
    );

    // Apply the same filters as TicketController
    if (teacher) {
      tickets = tickets.filter((t) => {
        // Handle both string and object teacher formats
        if (typeof t.teacher === "string") {
          return t.teacher.toLowerCase() === String(teacher).toLowerCase();
        } else if (t.teacher && typeof t.teacher === "object" && "email" in t.teacher) {
          const teacherObj = t.teacher as TeacherObject;
          return teacherObj.email?.toLowerCase() === String(teacher).toLowerCase();
        }
        return t.email?.toLowerCase() === String(teacher).toLowerCase();
      });
    }

    if (status) {
      tickets = tickets.filter(
        (t) => t.status?.toLowerCase() === String(status).toLowerCase()
      );
    }

    if (category) {
      tickets = tickets.filter(
        (t) => t.category?.toLowerCase() === String(category).toLowerCase()
      );
    }

    if (fromDate || toDate) {
      tickets = tickets.filter((t) => {
        if (!t.timestamp) return false;

        // Convert Firestore timestamp to milliseconds
        const time = t.timestamp._seconds * 1000 + t.timestamp._nanoseconds / 1000000;
        const from = fromDate ?
          new Date(String(fromDate)).getTime() :
          -Infinity;
        const to = toDate ? new Date(String(toDate)).getTime() : Infinity;

        return time >= from && time <= to;
      });
    }

    res.status(200).json({
      message: "Tickets with oneononesessions > 0 fetched successfully",
      ticketCount: tickets.length,
      tickets,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in OneOnOneTicketController:", errorMessage);
    res.status(500).json({error: "Internal server error"});
  }
};
