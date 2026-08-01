const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Template = require("../models/Template");
const User = require("../models/User");

dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

const ADMIN_EMAIL = "admin@gmail.com";

const seed = async () => {
  await connectDB();

  const admin = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    { $set: { role: "admin" } },
    { new: true }
  );

  if (!admin) {
    console.log("No admin user exists yet. Register admin@gmail.com once, then rerun this seed if you want createdBy set to that account.");
  }

  await Template.findOneAndUpdate(
    { title: "Elegant Wedding" },
    {
      title: "Elegant Wedding",
      category: "Wedding",
      thumbnail: "/src/assets/covers/invite-studio-1779694621364.png",
      description: "The original InviteStudio wedding invitation template.",
      isPremium: false,
      status: "published",
      createdBy: admin?._id,
      editorData: {
        type: "inviteStudioConfig",
        templateId: "elegant-wedding",
      },
      fabricJson: {
        type: "inviteStudioConfig",
        templateId: "elegant-wedding",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("Seeded admin role and first published template.");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});