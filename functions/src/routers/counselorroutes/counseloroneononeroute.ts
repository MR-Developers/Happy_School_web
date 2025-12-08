import express, {Router} from "express";
/* eslint-disable max-len */
import {oneononecontroller} from "../../controllers/counselor/counseloroneononecontroller";
// eslint-disable-next-line new-cap
const router: Router = express.Router();

router.get("/:email", oneononecontroller);

export default router;
