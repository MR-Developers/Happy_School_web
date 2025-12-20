/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import express from "express";
import {fetchteachers} from "../../controllers/Co-ordinator/Fetchteachers";

const router = express.Router();

router.get("/:wingId", fetchteachers);

export default router;
