import express, {Router} from "express";
/* eslint-disable max-len */
import {counselorticketcontroller} from "../../controllers/counselor/counselorticketscontroller";
// eslint-disable-next-line new-cap
const router: Router = express.Router();

router.get("/:email", counselorticketcontroller);

export default router;
