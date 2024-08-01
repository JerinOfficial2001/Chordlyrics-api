const express = require("express");
const router = express.Router();

router.post("/add");
router.get("/getall");
router.delete("/delete/:id");
router.put("/update/:id");

module.exports = router;
