const express = require("express");
const {
  getPublishedTemplates,
  getPublishedTemplateById,
  getPublishedTemplateThumbnail,
} = require("../controllers/templateController");

const router = express.Router();

router.get("/", getPublishedTemplates);
router.get("/:id/thumbnail", getPublishedTemplateThumbnail);
router.get("/:id", getPublishedTemplateById);

module.exports = router;
