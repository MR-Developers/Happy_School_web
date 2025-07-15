import express, { Router } from "express";
import { YourTicketController } from "../controllers/YourTicketController";

const router: Router = express.Router();

router.get("/yourtickets/:email", YourTicketController);

export default router;
