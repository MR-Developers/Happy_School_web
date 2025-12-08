import express from "express";
/* eslint-disable max-len */
import {getcounselordashboardsummary} from "../../controllers/counselor/counselordashboardcontroller";
// eslint-disable-next-line new-cap
const router = express.Router();

router.get("/:email", getcounselordashboardsummary);
export default router;
