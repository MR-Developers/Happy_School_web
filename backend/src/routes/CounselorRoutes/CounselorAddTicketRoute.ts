import express, { Router } from "express";
import { CounselorAddTicketController } from "../../controllers/Counselor/CounselorAddTicketController";

const router: Router = express.Router();

router.post("/:email/:school", CounselorAddTicketController);

export default router;
