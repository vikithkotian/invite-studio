const mongoose = require("mongoose");

const TEMPLATE_CATEGORIES = ["Wedding", "Engagement", "Reception", "Baby Shower"];
const TEMPLATE_STATUSES = ["draft", "published"];

const templateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Template title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Template category is required"],
      enum: TEMPLATE_CATEGORIES,
    },
    thumbnail: {
      type: String,
      required: [true, "Template thumbnail is required"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    editorData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    fabricJson: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: TEMPLATE_STATUSES,
      default: "draft",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

templateSchema.index({ status: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model("Template", templateSchema);
module.exports.TEMPLATE_CATEGORIES = TEMPLATE_CATEGORIES;
module.exports.TEMPLATE_STATUSES = TEMPLATE_STATUSES;
