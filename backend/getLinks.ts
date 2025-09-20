/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import {getschoolreports} from "../controllers/getLinks";
// eslint-disable-next-line new-cap
const router = express.Router();

router.get("/getSchoolReports/:schoolName", getschoolreports);

export default router;
