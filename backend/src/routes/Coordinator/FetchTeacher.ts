import express from "express";
import { FetchTeachers } from "../../controllers/Co-ordinator/FetchTeachers";
const router = express.Router();

router.get("/:wingId", FetchTeachers);

export default router;