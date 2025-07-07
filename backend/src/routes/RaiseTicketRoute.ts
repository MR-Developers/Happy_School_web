import express, { Router } from "express";
import { RaiseTicketController } from "../controllers/RaiseTicketController";

const router: Router = express.Router();

router.post("/raiseTicket/:email", RaiseTicketController);

export default router;
