import express, {Router} from "express";
/* eslint-disable max-len */
import {getallschools} from "../../controllers/counselor/counselorschoolscontroller";
// eslint-disable-next-line new-cap
const router: Router = express.Router();

router.get("/:email", getallschools);

export default router;
