const express = require("express");
const router = express.Router();

const {YourTicketController} = require("../controllers/YourTicketController");

router.get("/yourtickets/:email", YourTicketController);

module.exports = router;