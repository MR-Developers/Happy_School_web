import express, { Router } from "express";
import { CounselorTeacherController } from "../../controllers/Counselor/CouselorTeachersController";

const router: Router = express.Router();

router.get("/:email", CounselorTeacherController);

export default router;
