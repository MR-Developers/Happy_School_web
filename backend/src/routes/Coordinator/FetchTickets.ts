import express from "express";
import { FetchTickets } from "../../controllers/Co-ordinator/FetchTickets";

const router = express.Router();

router.get("/:wingId", FetchTickets);
export default router;