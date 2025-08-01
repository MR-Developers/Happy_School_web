// functions/src/routes/taskRoutes.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */

import {Router, Request, Response} from "express";
import {db} from "../config/firebase";

// eslint-disable-next-line new-cap
const router = Router();


router.get("/:school/:challengeName", async (req: Request, res: Response) => {
  const {school, challengeName} = req.params;

  if (!school || !challengeName) {
    res.status(400).json({error: "School and challenge name are required"});
    return;
  }

  try {
    const taskCollectionRef = db
      .collection("Content")
      .doc("Content")
      .collection(school)
      .doc(school)
      .collection("Challenges")
      .doc(challengeName)
      .collection("Tasks");

    const snapshot = await taskCollectionRef.get();

    if (snapshot.empty) {
      res.status(200).json({message: "No tasks found", tasks: []});
      return;
    }

    const taskNames = snapshot.docs.map((doc: { id: any; }) => doc.id);

    res.status(200).json({
      message: "Tasks fetched successfully",
      school,
      challengeName,
      tasks: taskNames,
    });
  } catch (error: any) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({error: "Failed to fetch tasks"});
  }
});

export default router;
