import express, {Router} from "express";
import {oneononecontroller} from "../controllers/oneonone";
// eslint-disable-next-line new-cap
const router: Router = express.Router();

router.get("/:email", oneononecontroller);

export default router;
