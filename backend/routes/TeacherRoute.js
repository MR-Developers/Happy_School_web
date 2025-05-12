const express = require("express");
const router = express.Router();

const {TeacherController} = require("../controllers/TechersControllers");

router.get("/teachers/:email", TeacherController);

module.exports = router;