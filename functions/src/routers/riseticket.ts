// functions/src/routers/ticketRoute.ts

import express from "express";
import { raiseticket } from "../controllers/raiseticket";
// If you have this too

const router = express.Router();

router.post("/:email", raiseticket);


export default router;
