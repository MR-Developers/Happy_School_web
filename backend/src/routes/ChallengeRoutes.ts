import express from "express";
import { getChallengesBySchool } from "../controllers/ChallengeController";

const router = express.Router();

router.get("/:school", getChallengesBySchool);

export default router;
