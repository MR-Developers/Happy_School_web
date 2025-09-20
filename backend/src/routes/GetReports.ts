import express from "express";
import { getSchoolReports } from "../controllers/GetReportLink";

const router = express.Router();

router.get("/getSchoolReports/:schoolName", getSchoolReports);

export default router;
