/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import express from "express";
import {fetchtickets} from "../../controllers/Co-ordinator/Fetchtickets";

const router = express.Router();

router.get("/:email", fetchtickets);
export default router;
