import express from "express";
import { getCounselorDashboardSummary } from "../../controllers/Counselor/CounselorDashboardController";

const router = express.Router();

router.get("/:email", getCounselorDashboardSummary);
export default router;
