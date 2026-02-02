import express, { Router } from "express";
import { CounselorTicketController } from "../../controllers/Counselor/CounselorTicketsController";
import { updateTicketSessionCount, getTicketDetails } from "../../controllers/Counselor/TicketSessionController";

const router: Router = express.Router();

router.get("/:email", CounselorTicketController);
router.post("/session-count", updateTicketSessionCount);
router.get("/details", getTicketDetails);

export default router;
