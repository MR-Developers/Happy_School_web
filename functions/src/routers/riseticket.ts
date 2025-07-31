// functions/src/routers/ticketRoute.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import express from "express";
import {raiseticket} from "../controllers/raiseticket";
// If you have this too
// eslint-disable-next-line new-cap
const router = express.Router();

router.post("/:email", raiseticket);


export default router;
