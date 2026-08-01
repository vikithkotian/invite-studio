const express = require("express");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getAdminTemplates,
  getAdminTemplateById,
  createTemplate,
  updateTemplate,
  saveTemplateEditorData,
  updateTemplateStatus,
  deleteTemplate,
  getAdminStats,
  getAdminUsers,
} = require("../controllers/templateController");

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.get("/templates", getAdminTemplates);
router.post("/templates", createTemplate);
router.get("/templates/:id", getAdminTemplateById);
router.put("/templates/:id", updateTemplate);
router.put("/templates/:id/editor-data", saveTemplateEditorData);
router.patch("/templates/:id/status", updateTemplateStatus);
router.delete("/templates/:id", deleteTemplate);

module.exports = router;