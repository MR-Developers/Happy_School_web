import express, { Router } from "express";
import { CounselorAddTicketTeacherController } from "../../controllers/Counselor/CounselorAddTicketTeacherController";

const router: Router = express.Router();

router.get("/:school", CounselorAddTicketTeacherController);

export default router;
