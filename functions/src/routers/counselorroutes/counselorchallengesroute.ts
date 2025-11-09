import express from "express";
/* eslint-disable max-len */
import {counselorchallengecontroller} from "../../controllers/counselor/counselorchallengescontroller";
// eslint-disable-next-line new-cap
const router = express.Router();

router.get("/:email", counselorchallengecontroller);

export default router;
