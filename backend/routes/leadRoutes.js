const express = require("express");
const router = express.Router();
const {
    createLead,
    getLeads,
    updateLeadStatus,
} = require("../controller/leadController");

router.get("/", getLeads);
router.post("/", createLead);
router.patch("/:id/status", updateLeadStatus);

module.exports = router;