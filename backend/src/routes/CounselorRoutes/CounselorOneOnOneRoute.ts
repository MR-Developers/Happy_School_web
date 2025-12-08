import express, { Router } from "express";
import { OneOnOneController } from "../../controllers/Counselor/CounselorOneOnOneController";

const router: Router = express.Router();

router.get("/:email", OneOnOneController);

export default router;
