/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import express, {Router} from "express";
import {counseloraddticketcontroller} from "../../controllers/counselor/counseloraddticketcontroller";
// eslint-disable-next-line new-cap
const router: Router = express.Router();

router.post("/:email/:school", counseloraddticketcontroller);

export default router;
