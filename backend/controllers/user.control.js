import { validationResult } from "express-validator";
import {
  registerFunction,
  loginFunction,
  validateUrl,
  claimGuestLink,
  redirectFunction,
  userFunction,
  deleteLinkFunction,
  inspectLinkFunction,
  getLinkClicksFunction,
} from "../services/user.service.js";
import { userModel } from "../model/user.schema.js";

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  return req.body?.token || req.query?.token || null;
};

export const userRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0]?.msg || "Validation failed",
      errors: errors.array(),
    });
  }

  const { username, email, fullName, password } = req.body;

  try {
    const user = await registerFunction({
      username,
      email,
      fullName,
      password,
    });
    const token = user.generateToken();

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    const statusCode = err.statusCode || (err.code === 11000 ? 409 : 400);
    let message = err.message;
    if (err.code === 11000) {
      message = err.keyPattern?.email
        ? "Email is already registered"
        : "Username is already taken";
    }
    return res.status(statusCode).json({
      message,
      success: false,
    });
  }
};

export const userLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0]?.msg || "Validation failed",
      errors: errors.array(),
    });
  }

  const { username, email, identifier, password } = req.body;

  try {
    const { token, user } = await loginFunction({
      username,
      email,
      identifier,
      password,
    });

    return res.status(200).json({
      message: "User login successful",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    return res.status(err.statusCode || 401).json({
      message: err.message || "Invalid credentials",
      success: false,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token required",
    });
  }

  try {
    const dummy = new userModel();
    const decodedToken = await dummy.jwtVerify(token);
    if (!decodedToken?.userId) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await userModel
      .findById(decodedToken.userId)
      .select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
    });
  } catch {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid",
    });
  }
};

export const updateUserProfile = async (req, res) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token required",
    });
  }

  try {
    const dummy = new userModel();
    const decodedToken = await dummy.jwtVerify(token);
    if (!decodedToken?.userId) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await userModel.findById(decodedToken.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { username, email, fullName, currentPassword, newPassword } =
      req.body;

    // Check username uniqueness if changed
    if (username && username.toLowerCase().trim() !== user.username) {
      const existingUser = await userModel.findOne({
        username: username.toLowerCase().trim(),
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken",
        });
      }
      user.username = username.toLowerCase().trim();
    }

    // Check email uniqueness if changed
    if (email && email.toLowerCase().trim() !== user.email) {
      const existingEmail = await userModel.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id },
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered",
        });
      }
      user.email = email.toLowerCase().trim();
    }

    // Update full name if provided
    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }

    // Password change verification
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to change password",
        });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password does not match",
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long",
        });
      }
      user.password = newPassword;
    }

    await user.save();

    const newToken = user.generateToken();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      token: newToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update profile",
    });
  }
};

export const urlValidation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0]?.msg || "Invalid URL request",
      errors: errors.array(),
    });
  }

  const token = extractToken(req);
  const { url } = req.body;

  try {
    const shortLink = await validateUrl({ url, token });
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return res.status(200).json({
      message: "URL generated successfully",
      success: true,
      url: `${baseUrl}/api/v1/${shortLink.redirectKey}`,
      redirectKey: shortLink.redirectKey,
      originalUrl: shortLink.originalUrl,
      clicks: shortLink.clicks,
      isSaved: Boolean(shortLink.owner),
      createdAt: shortLink.createdAt,
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      message: err.message,
      success: false,
    });
  }
};

export const claimUrlController = async (req, res) => {
  const token = extractToken(req);
  const { redirectKey } = req.body;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required to claim link",
    });
  }

  if (!redirectKey) {
    return res.status(400).json({
      success: false,
      message: "Redirect key is required",
    });
  }

  try {
    const claimed = await claimGuestLink({ redirectKey, token });
    if (!claimed) {
      return res.status(404).json({
        success: false,
        message: "Link not found or already claimed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Link claimed and added to your account successfully",
      link: claimed,
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};

export const redirectUrlController = async (req, res) => {
  const { redirectKey } = req.params;

  if (!redirectKey) {
    return res
      .status(400)
      .json({ message: "Redirect key is required", success: false });
  }

  try {
    const targetUrl = await redirectFunction({ redirectKey });
    return res.redirect(targetUrl);
  } catch (err) {
    return res.status(err.statusCode || 404).json({
      message: err.message || "Short URL not found",
      success: false,
    });
  }
};

export const getProfile = async (req, res) => {
  const token = extractToken(req);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication token is required", success: false });
  }

  try {
    const offset = req.query.offset !== undefined ? req.query.offset : 0;
    const limit = req.query.limit !== undefined ? req.query.limit : 8;

    const result = await userFunction({ token, offset, limit });
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return res.status(200).json({
      message: "Profile links fetched successfully",
      success: true,
      data: result.links.map((link) => ({
        _id: link._id,
        originalUrl: link.originalUrl,
        shortUrl: `${baseUrl}/api/v1/${link.redirectKey}`,
        redirectKey: link.redirectKey,
        createdAt: link.createdAt,
        clicks: link.clicks,
      })),
      pagination: {
        total: result.total,
        totalClicks: result.totalClicks,
        offset: result.offset,
        limit: result.limit,
        hasMore: result.hasMore,
      },
    });
  } catch (err) {
    return res.status(err.statusCode || 401).json({
      message: err.message,
      success: false,
    });
  }
};

export const deleteUrlController = async (req, res) => {
  const token = extractToken(req);
  const { redirectKey } = req.params;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication token required", success: false });
  }

  try {
    await deleteLinkFunction({ redirectKey, token });
    return res.status(200).json({
      message: "Short link deleted successfully",
      success: true,
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      message: err.message,
      success: false,
    });
  }
};

export const inspectLinkController = async (req, res) => {
  const { redirectKey } = req.params;
  const token = extractToken(req);

  if (!redirectKey) {
    return res.status(400).json({
      success: false,
      message: "Redirect key is required",
    });
  }

  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const data = await inspectLinkFunction({ redirectKey, token, baseUrl });

    return res.status(200).json({
      success: true,
      message: "Link inspection data retrieved",
      data,
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getLinkClicksController = async (req, res) => {
  const { redirectKey } = req.params;

  if (!redirectKey) {
    return res.status(400).json({
      success: false,
      message: "Redirect key is required",
    });
  }

  try {
    const data = await getLinkClicksFunction({ redirectKey });
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};
