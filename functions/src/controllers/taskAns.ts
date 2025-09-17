// functions/src/routes/answerRoutes.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import {Router, Request, Response} from "express";
import {db} from "../config/firebase";
// eslint-disable-next-line new-cap
const router = Router();

router.get("/:challengeId/:taskName", async (req: Request, res: Response) => {
  const {challengeId} = req.params;
  const taskName = decodeURIComponent(req.params.taskName);

  console.log("Fetching answers for:", challengeId, taskName);

  if (!challengeId || !taskName) {
    res.status(400).json({error: "challengeId and taskName are required"});
    return;
  }

  try {
    const snapshot = await db
      .collection("answers")
      .doc(challengeId)
      .collection(taskName)
      .get();

    console.log("Snapshot size:", snapshot.size);

    if (snapshot.empty) {
      res.status(200).json({error: "No answers found"});
      return;
    }

    const documentNames: string[] = snapshot.docs.map((doc) => doc.id);

    res.status(200).json({
      message: "Answer document names fetched successfully",
      challengeId,
      taskName,
      documentNames,
    });
  } catch (error: any) {
    console.error("Error fetching answers:", error.message);
    res.status(500).json({error: "Failed to retrieve answer documents"});
  }
});

export default router;
