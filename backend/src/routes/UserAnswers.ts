import { Router } from "express";
import { getAnswersByChallengeAndTask } from "../controllers/UserAnswerControllers";

const router = Router();

router.get("/:challengeId/:taskName", getAnswersByChallengeAndTask);

export default router;
