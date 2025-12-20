/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import {Request, Response} from "express";
import admin from "../../config/firebase";

const db = admin.firestore();

export const counseloraddticketwingcontroller = async (
  req: Request,
  res: Response
): Promise<void> => {
  const school: string = req.params.school;

  try {
    if (!school) {
      console.error("School not found");
      res.status(400).json({error: "School is required"});
      return;
    }

    const wingsSnapshot = await db
      .collection("Wings")
      .where("schoolName", "==", school)
      .get();

    if (wingsSnapshot.empty) {
      res.status(200).json({
        message: "No wings found for this school",
        wings: [],
        count: 0,
      });
      return;
    }

    const wings = wingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      message: "Wings fetched successfully",
      wings,
      count: wings.length,
    });
  } catch (error: any) {
    console.error("Error fetching wings:", error.message);
    res.status(500).json({error: "Server error"});
  }
};
