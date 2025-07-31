// routers/login.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import express from "express";
import {loginuser} from "../controllers/login";

// eslint-disable-next-line new-cap
const router = express.Router();

router.post("/login", loginuser);

export default router;
