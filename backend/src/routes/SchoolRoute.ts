import express, { Router } from "express";
import { getAllSchools } from "../controllers/SchoolsController";

const router: Router = express.Router();

router.get("/schools", getAllSchools);

export default router;
