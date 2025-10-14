import express from "express";
import { CounselorChallengeController } from "../../controllers/Counselor/CounselorChallengesController";

const router = express.Router();

router.get("/:email", CounselorChallengeController);

export default router;
