// functions/src/routes/challengeRoutes.ts

// functions/src/routes/ticketRoutes.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */

import {Router, Request, Response} from "express";
import {db} from "../config/firebase";
// eslint-disable-next-line new-cap
const router = Router();


router.get("/challenges/:school", async (req: Request, res: Response) => {
  const {school} = req.params;

  if (!school) {
    res.status(400).json({error: "School name is required"});
    return;
  }

  try {
    const docRef = db
      .collection("Content")
      .doc("Content")
      .collection(school)
      .doc(school)
      .collection("ChallengeNames")
      .doc("ChallengeNames");

    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      res.status(404).json({error: "No challenges found for the school"});
      return;
    }

    const challengeData = docSnap.data();

    res.status(200).json({
      message: "Challenges fetched successfully",
      school,
      challenges: challengeData,
    });
  } catch (error: any) {
    console.error("Error fetching challenges:", error.message);
    res.status(500).json({error: "Failed to retrieve challenges"});
  }
});

export default router;
