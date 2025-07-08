import express from "express";
import { ticket } from "../controllers/tickets";

const router = express.Router();

// GET /tickets/:email
router.get("/:email", ticket);

export default router;
