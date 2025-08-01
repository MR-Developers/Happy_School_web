// functions/src/routers/teacherRoute.ts

/* eslint-disable @typescript-eslint/no-explicit-any */


/* eslint-disable max-len */

import express from "express";
import {teacher} from "../controllers/teacher";
// eslint-disable-next-line new-cap
const router = express.Router();

// GET /teachers/:email
router.get("/:email", teacher);

export default router;
