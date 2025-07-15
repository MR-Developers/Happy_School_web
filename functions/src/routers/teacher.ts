// functions/src/routers/teacherRoute.ts

import express from "express";
import { teacher } from "../controllers/teacher";

const router = express.Router();

// GET /teachers/:email
router.get("/:email", teacher);

export default router;
