import express, {Router} from "express";
/* eslint-disable max-len */
import {counseloraddticketteachercontroller} from "../../controllers/counselor/counseloraddticketteachercontroller";
// eslint-disable-next-line new-cap
const router: Router = express.Router();

router.get("/:school", counseloraddticketteachercontroller);

export default router;
