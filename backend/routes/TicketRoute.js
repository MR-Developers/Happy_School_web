const express = require("express");
const router = express.Router();

const {TicketController} = require("../controllers/TicketController");

router.get("/alltickets/:email", TicketController);

module.exports = router;