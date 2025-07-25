// src/routes/chat.routes.ts
import { Router } from "express";
import { getChatByTicketId } from "../controllers/ChatController";

const router = Router();

router.get("/:ticketId", getChatByTicketId);

export default router;
