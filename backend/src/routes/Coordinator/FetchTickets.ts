import express from "express";
import { FetchTickets } from "../../controllers/Co-ordinator/FetchTickets";

const router = express.Router();

router.get("/:email", FetchTickets);
export default router;