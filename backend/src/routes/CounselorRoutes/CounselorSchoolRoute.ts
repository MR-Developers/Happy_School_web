import express, { Router } from "express";
import { getAllSchools } from "../../controllers/Counselor/CounselorSchoolsController";

const router: Router = express.Router();

router.get("/:email", getAllSchools);

export default router;
