const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const ADMIN_EMAIL = "admin@gmail.com";

const getRoleForEmail = (email) =>
  String(email || "").toLowerCase().trim() === ADMIN_EMAIL ? "admin" : "user";

const syncUserRole = async (user) => {
  const expectedRole = getRoleForEmail(user.email);

  if (user.role !== expectedRole) {
    user.role = expectedRole;
    await user.save({ validateBeforeSave: false });
  }

  return user;
};

const generateToken = (user) => {
  try {
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    console.log(`JWT generation success for user ID: ${user._id}`);
    return token;
  } catch (error) {
    console.error(`JWT generation failure for user ID: ${user._id}:`, error.message);
    throw error;
  }
};

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const createResetToken = (user) => {
  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

const createEmailTransport = () =>
  nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || "gmail",
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: process.env.EMAIL_USER
      ? {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
      : undefined,
  });

const registerUser = async (req, res) => {
  console.log(`Incoming signup request for: ${req.body ? req.body.email : "undefined"}`);
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!name || !normalizedEmail || !password) {
      console.log(`Signup failed: Missing fields for email: ${email}`);
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      console.log(`Signup failed: User with email ${normalizedEmail} already exists`);
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: getRoleForEmail(normalizedEmail),
    });

    if (user) {
      const token = generateToken(user);
      console.log(`Signup success for: ${normalizedEmail}`);
      return res.status(201).json({ token, user: serializeUser(user) });
    }

    console.log(`Signup failed: Invalid user data for ${normalizedEmail}`);
    return res.status(400).json({ message: "Invalid user data" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error occurred during registration" });
  }
};

const loginUser = async (req, res) => {
  console.log(`Incoming login request for: ${req.body ? req.body.email : "undefined"}`);
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!normalizedEmail || !password) {
      console.log("Login failed: Missing email or password");
      return res.status(400).json({ message: "Please enter email and password" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await bcrypt.compare(password, user.password))) {
      await syncUserRole(user);

      const token = generateToken(user);
      console.log(`Login success for: ${normalizedEmail}`);
      return res.status(200).json({ token, user: serializeUser(user) });
    }

    console.log(`Login failed: Invalid credentials for ${normalizedEmail}`);
    res.status(400).json({ message: "Invalid email or password" });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server error occurred during login" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please enter your email address" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`Incoming forgot-password request for: ${normalizedEmail}`);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log(`Forgot-password failed: no user found for ${normalizedEmail}`);
      return res.status(404).json({ message: "No account found with that email address." });
    }

    const resetToken = createResetToken(user);
    console.log(`Forgot-password token generated for user ${user._id} (token prefix: ${resetToken.slice(0, 8)}...)`);
    await user.save({ validateBeforeSave: false });
    console.log(`Forgot-password token saved for user ${user._id}`);

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Forgot-password email config missing EMAIL_USER or EMAIL_PASS");
      return res.status(500).json({ message: "Email service is not configured on the server." });
    }

    const transporter = createEmailTransport();
    console.log(`Sending reset email to ${user.email} via Gmail SMTP`);
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: user.email,
      subject: "InviteStudio password reset",
      text: `We received a password reset request for your InviteStudio account. Reset it here: ${resetUrl}\n\nThis link expires in 1 hour.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin: 0 0 16px;">Reset your InviteStudio password</h2>
          <p style="margin: 0 0 16px;">We received a password reset request for your account.</p>
          <p style="margin: 0 0 24px;"><a href="${resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#C7B8EA;color:#ffffff;text-decoration:none;font-weight:600;">Reset password</a></p>
          <p style="margin: 0; color: #6b7280;">This link expires in 1 hour.</p>
        </div>
      `,
    });

    console.log(`Reset email sent successfully to ${user.email}`);

    return res.status(200).json({ message: "Password reset link sent to your email address." });
  } catch (error) {
    console.error("Error creating password reset request:", error);
    return res.status(500).json({
      message: error.message || "Failed to send password reset email",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Please enter a new password" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    console.log(`Password reset attempt with token prefix: ${token.slice(0, 8)}...`);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.log("Password reset failed: invalid or expired token");
      return res.status(400).json({ message: "Password reset token is invalid or has expired" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    console.log(`Password reset success for user ${user._id}`);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Server error occurred while resetting password" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};