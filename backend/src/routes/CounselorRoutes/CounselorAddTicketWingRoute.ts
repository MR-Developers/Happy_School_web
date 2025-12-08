import express, { Router } from "express";
import { CounselorAddTicketWingController } from "../../controllers/Counselor/CounselorAddTicketWingController";

const router: Router = express.Router();

router.get("/:school", CounselorAddTicketWingController);

export default router;
