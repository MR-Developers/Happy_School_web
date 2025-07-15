import express from "express";
import { loginUser } from "../controllers/Login";

const router = express.Router();

router.post("/login", loginUser);

export default router;
