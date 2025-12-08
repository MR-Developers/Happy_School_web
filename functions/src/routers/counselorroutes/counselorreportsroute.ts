import express from "express";
/* eslint-disable max-len */
import {getcounselorschoolreports} from "../../controllers/counselor/counselorreportscontroller";
// eslint-disable-next-line new-cap
const router = express.Router();

router.get("/:email", getcounselorschoolreports);

export default router;
