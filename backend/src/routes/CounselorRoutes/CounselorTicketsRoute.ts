import express, { Router } from "express";
import { CounselorTicketController } from "../../controllers/Counselor/CounselorTicketsController";

const router: Router = express.Router();

router.get("/:email", CounselorTicketController);

export default router;
