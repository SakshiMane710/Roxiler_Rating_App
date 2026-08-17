const express = require("express");

const router = express.Router();

const testController = require("../controllers/testController");

router.post("/test", testController);

module.exports = router;