import express, { Router } from "express";
import { TicketController } from "../controllers/TicketController";

const router: Router = express.Router();

router.get("/alltickets/:email", TicketController);

export default router;
