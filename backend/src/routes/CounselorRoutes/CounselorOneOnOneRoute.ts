import express, { Router } from "express";
import { OneOnOneController } from "../../controllers/Counselor/CounselorOneonOneController";

const router: Router = express.Router();

router.get("/:email", OneOnOneController);

export default router;
