import express from "express";
import { getCounselorSchoolReports } from "../../controllers/Counselor/CounselorReportsController";

const router = express.Router();

router.get("/:email", getCounselorSchoolReports);

export default router;
