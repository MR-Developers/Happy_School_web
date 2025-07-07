import express, { Router } from "express";
import { TeacherController } from "../controllers/TechersControllers";

const router: Router = express.Router();

router.get("/teachers/:email", TeacherController);

export default router;
