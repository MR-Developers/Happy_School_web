const express = require("express");
const router = express.Router();

const {RaiseTicketController} = require("../controllers/RaiseTicketController");

router.post("/raiseTicket/:email", RaiseTicketController);

module.exports = router;