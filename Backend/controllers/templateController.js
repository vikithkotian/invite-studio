const Template = require("../models/Template");
const User = require("../models/User");
const path = require("path");

const TEMPLATE_LIST_FIELDS = "_id title category thumbnail description isPremium status";
const THUMBNAIL_ALIAS_UNSET = {
  thumbnailImage: "",
  cover: "",
  coverImage: "",
  imageUrl: "",
};

const describeThumbnail = (thumbnail) => {
  const value = typeof thumbnail === "string" ? thumbnail : "";
  return {
    field: "thumbnail",
    present: Boolean(value),
    length: value.length,
    preview: value ? `${value.slice(0, 80)}${value.length > 80 ? "..." : ""}` : "",
  };
};

const logThumbnailAliases = (source, body) => {
  const aliases = ["thumbnailImage", "cover", "coverImage", "imageUrl"].filter((field) => body[field] !== undefined);
  if (aliases.length) {
    console.warn(`[Template Thumbnail] ${source} received deprecated thumbnail aliases: ${aliases.join(", ")}. Use thumbnail only.`);
  }
};

const parseJsonValue = (value) => {
  if (typeof value !== "string") return value;
  return JSON.parse(value);
};

const pickTemplateFields = (body) => {
  logThumbnailAliases("metadata save", body);
  const payload = {};
  ["title", "category", "thumbnail", "description", "status"].forEach((field) => {
    if (body[field] !== undefined) payload[field] = body[field];
  });
  if (body.isPremium !== undefined) payload.isPremium = Boolean(body.isPremium);
  if (body.editorData !== undefined) payload.editorData = parseJsonValue(body.editorData);
  if (body.fabricJson !== undefined) payload.fabricJson = parseJsonValue(body.fabricJson);
  return payload;
};

const getLocalThumbnailPath = (thumbnail) => {
  const thumbnailPath = String(thumbnail || "");
  if (!thumbnailPath.startsWith("/")) return null;

  const normalizedPath = thumbnailPath.replace(/\\/g, "/");
  const fileName = path.basename(normalizedPath);

  if (normalizedPath.startsWith("/src/assets/covers/") || normalizedPath.startsWith("/assets/covers/") || normalizedPath.startsWith("/covers/")) {
    return path.resolve(__dirname, "../../FrontEnd/public/covers", fileName);
  }

  return null;
};

const formatTemplateListItem = (template) => ({
  _id: template._id,
  title: template.title,
  category: template.category,
  thumbnail: template.thumbnail,
  description: template.description,
  isPremium: Boolean(template.isPremium),
  premium: Boolean(template.isPremium),
  status: template.status,
});

const getPublishedTemplates = async (req, res) => {
  try {
    const filter = { status: "published" };
    if (req.query.category) filter.category = req.query.category;

    const templates = await Template.find(filter)
      .select(TEMPLATE_LIST_FIELDS)
      .sort({ createdAt: -1 })
      .lean();

    const formattedTemplates = templates.map((template) => {
      console.log("[Template Thumbnail] GET /api/templates item", {
        templateId: String(template._id),
        ...describeThumbnail(template.thumbnail),
      });
      return formatTemplateListItem(template);
    });

    res.status(200).json({ templates: formattedTemplates });
  } catch (error) {
    console.error("Error fetching published templates:", error);
    res.status(500).json({ message: "Failed to fetch templates" });
  }
};

const getPublishedTemplateThumbnail = async (req, res) => {
  try {
    const template = await Template.findOne({ _id: req.params.id, status: "published" })
      .select("thumbnail")
      .lean();

    if (!template?.thumbnail) {
      return res.status(404).json({ message: "Template thumbnail not found" });
    }

    console.log("[Template Thumbnail] GET /api/templates/:id/thumbnail", {
      templateId: String(req.params.id),
      ...describeThumbnail(template.thumbnail),
    });

    const dataUrlMatch = String(template.thumbnail).match(/^data:([^;,]+)(;base64)?,(.*)$/);
    if (!dataUrlMatch) {
      const localThumbnailPath = getLocalThumbnailPath(template.thumbnail);
      if (localThumbnailPath) {
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.sendFile(localThumbnailPath);
      }

      return res.redirect(template.thumbnail);
    }

    const [, mimeType, base64Flag, data] = dataUrlMatch;
    const imageBuffer = Buffer.from(data, base64Flag ? "base64" : "utf8");

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).send(imageBuffer);
  } catch (error) {
    console.error("Error fetching template thumbnail:", error);
    res.status(500).json({ message: "Failed to fetch template thumbnail" });
  }
};

const getPublishedTemplateById = async (req, res) => {
  try {
    const template = await Template.findOne({ _id: req.params.id, status: "published" });
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    console.log("[Template Thumbnail] GET /api/templates/:id", {
      templateId: String(template._id),
      ...describeThumbnail(template.thumbnail),
    });

    res.status(200).json({ template });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ message: "Failed to fetch template" });
  }
};

const getAdminTemplates = async (_req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    templates.forEach((template) => {
      console.log("[Template Thumbnail] GET /api/admin/templates item", {
        templateId: String(template._id),
        ...describeThumbnail(template.thumbnail),
      });
    });
    res.status(200).json({ templates });
  } catch (error) {
    console.error("Error fetching admin templates:", error);
    res.status(500).json({ message: "Failed to fetch templates" });
  }
};

const getAdminTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    console.log("[Template Thumbnail] GET /api/admin/templates/:id", {
      templateId: String(template._id),
      ...describeThumbnail(template.thumbnail),
    });

    res.status(200).json({ template });
  } catch (error) {
    console.error("Error fetching admin template:", error);
    res.status(500).json({ message: "Failed to fetch template" });
  }
};

const createTemplate = async (req, res) => {
  try {
    const payload = pickTemplateFields(req.body);
    console.log("[Template Thumbnail] createTemplate saving", describeThumbnail(payload.thumbnail));
    const template = await Template.create({
      ...payload,
      status: payload.status || "draft",
      createdBy: req.user.id,
    });

    res.status(201).json({ template });
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(400).json({ message: error.message || "Failed to create template" });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const payload = pickTemplateFields(req.body);
    console.log("[Template Thumbnail] updateTemplate saving", {
      templateId: String(req.params.id),
      ...describeThumbnail(payload.thumbnail),
    });
    const template = await Template.findByIdAndUpdate(req.params.id, { $set: payload, $unset: THUMBNAIL_ALIAS_UNSET }, {
      new: true,
      runValidators: true,
      strict: false,
    });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json({ template });
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(400).json({ message: error.message || "Failed to update template" });
  }
};

const saveTemplateEditorData = async (req, res) => {
  try {
    const editorData = parseJsonValue(req.body.editorData);
    if (!editorData || typeof editorData !== "object") {
      return res.status(400).json({ message: "editorData is required" });
    }

    logThumbnailAliases("editor data save", req.body);
    const thumbnail = req.body.thumbnail;
    const updatePayload = { editorData, fabricJson: editorData };
    if (thumbnail) {
      updatePayload.thumbnail = thumbnail;
    }

    console.log("[Template Thumbnail] saveTemplateEditorData saving", {
      templateId: String(req.params.id),
      ...describeThumbnail(updatePayload.thumbnail),
    });

    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload, $unset: THUMBNAIL_ALIAS_UNSET },
      { new: true, runValidators: true, strict: false }
    );

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json({ template });
  } catch (error) {
    console.error("Error saving template editor data:", error);
    res.status(400).json({ message: error.message || "Failed to save template design" });
  }
};

const updateTemplateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({ message: "Invalid template status" });
    }

    const template = await Template.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json({ template });
  } catch (error) {
    console.error("Error updating template status:", error);
    res.status(400).json({ message: error.message || "Failed to update template status" });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json({ message: "Template deleted" });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({ message: "Failed to delete template" });
  }
};

const getAdminStats = async (_req, res) => {
  try {
    const [totalTemplates, publishedTemplates, draftTemplates, totalUsers] = await Promise.all([
      Template.countDocuments(),
      Template.countDocuments({ status: "published" }),
      Template.countDocuments({ status: "draft" }),
      User.countDocuments(),
    ]);

    res.status(200).json({ totalTemplates, publishedTemplates, draftTemplates, totalUsers });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
};

const getAdminUsers = async (_req, res) => {
  try {
    const users = await User.find()
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

module.exports = {
  getPublishedTemplates,
  getPublishedTemplateThumbnail,
  getPublishedTemplateById,
  getAdminTemplates,
  getAdminTemplateById,
  createTemplate,
  updateTemplate,
  saveTemplateEditorData,
  updateTemplateStatus,
  deleteTemplate,
  getAdminStats,
  getAdminUsers,
};
