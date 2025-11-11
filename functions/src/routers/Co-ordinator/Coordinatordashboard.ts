/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import express from "express";
import {getcoordinatordashboardsummary} from "../../controllers/Co-ordinator/Coordinatordashboard";

const router = express.Router();

router.get("/summary/:email", getcoordinatordashboardsummary);
export default router;
