/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import express from "express";
import {getdashboardsummary} from "../controllers/dashboard";

// eslint-disable-next-line new-cap
const router = express.Router();

router.get("/summary/:email", getdashboardsummary);

export default router;
