import express from "express";
import { getTasksBySchoolAndChallenge } from "../controllers/TasksController";

const router = express.Router();

router.get("/:school/:challengeName", getTasksBySchoolAndChallenge);

export default router;
