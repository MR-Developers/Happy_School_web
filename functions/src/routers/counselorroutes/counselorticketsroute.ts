import express, {Router} from "express";
/* eslint-disable max-len */
import {counselorticketcontroller} from "../../controllers/counselor/counselorticketscontroller";
import {updateTicketSessionCount, getTicketDetails} from "../../controllers/counselor/ticketsessioncontroller";
// eslint-disable-next-line new-cap
const router: Router = express.Router();

router.post("/session-count", updateTicketSessionCount);
router.get("/details", getTicketDetails);
router.get("/:email", counselorticketcontroller);

export default router;
