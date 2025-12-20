/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import express, {Router} from "express";
import {counseloraddticketwingcontroller} from "../../controllers/counselor/counseloraddticketwingcontroller";

const router: Router = express.Router();

router.get("/:school", counseloraddticketwingcontroller);

export default router;
