// routers/login.ts
import express from "express";
import {loginuser} from "../controllers/login";

// eslint-disable-next-line new-cap
const router = express.Router();

router.post("/login", loginuser);

export default router;
