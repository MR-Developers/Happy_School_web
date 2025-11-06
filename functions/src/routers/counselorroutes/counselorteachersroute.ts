import express, {Router} from "express";
/* eslint-disable max-len */
import {counselorteachercontroller} from "../../controllers/counselor/couselorteacherscontroller";
// eslint-disable-next-line new-cap
const router: Router = express.Router();

router.get("/:email", counselorteachercontroller);

export default router;
