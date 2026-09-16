import { nanoid } from "nanoid";
import { linkModel } from "../model/link.schema.js";
import { userModel } from "../model/user.schema.js";
import { AppError } from "../utils/global.error.js";

export const registerFunction = async ({ username, email, fullName, password }) => {
  if (!username || !email || !fullName || !password) {
    throw new AppError("All fields are required", 400);
  }

  const existingUsername = await userModel.findOne({
    username: username.toLowerCase().trim(),
  });
  if (existingUsername) {
    throw new AppError("Username is already taken", 409);
  }

  const existingEmail = await userModel.findOne({
    email: email.toLowerCase().trim(),
  });
  if (existingEmail) {
    throw new AppError("Email is already registered", 409);
  }

  const user = await userModel.create({
    username: username.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    fullName: fullName.trim(),
    password,
  });

  if (!user) {
    throw new AppError("Failed to create user", 500);
  }

  return user;
};

export const loginFunction = async ({ identifier, username, email, password }) => {
  const loginKey = (identifier || email || username || "").toLowerCase().trim();
  if (!loginKey || !password) {
    throw new AppError("Email/username and password are required", 400);
  }

  const user = await userModel.findOne({
    $or: [{ email: loginKey }, { username: loginKey }],
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = user.generateToken();
  return { token, user };
};

export const validateUrl = async ({ url, token }) => {
  if (!url) {
    throw new AppError("Destination URL is required", 400);
  }

  let validUrl = url.trim();
  if (!/^https?:\/\//i.test(validUrl)) {
    validUrl = `https://${validUrl}`;
  }

  try {
    new URL(validUrl);
  } catch {
    throw new AppError("Please provide a valid destination URL", 400);
  }

  let ownerId = null;
  if (token) {
    try {
      const dummy = new userModel();
      const decodedToken = await dummy.jwtVerify(token);
      if (decodedToken?.userId) {
        ownerId = decodedToken.userId;
      }
    } catch {
      // If token is invalid or expired, continue as guest creation
      ownerId = null;
    }
  }

  const shortLink = await linkModel.create({
    originalUrl: validUrl,
    owner: ownerId,
    redirectKey: nanoid(7),
  });

  if (!shortLink) {
    throw new AppError("Failed to create short link", 500);
  }

  return shortLink;
};

export const claimGuestLink = async ({ redirectKey, token }) => {
  if (!redirectKey || !token) {
    throw new AppError("Redirect key and token required", 400);
  }

  const dummy = new userModel();
  const decodedToken = await dummy.jwtVerify(token);
  if (!decodedToken?.userId) {
    throw new AppError("Invalid or expired session token", 401);
  }

  const link = await linkModel.findOneAndUpdate(
    { redirectKey, owner: null },
    { owner: decodedToken.userId },
    { new: true }
  );

  return link;
};

export const redirectFunction = async ({ redirectKey }) => {
  if (!redirectKey) {
    throw new AppError("Redirect key is required", 400);
  }

  const link = await linkModel.findOneAndUpdate(
    { redirectKey },
    { $inc: { clicks: 1 } },
    { new: true }
  );

  if (!link) {
    throw new AppError("Short link not found", 404);
  }

  return link.originalUrl;
};

export const userFunction = async ({ token, offset = 0, limit = 8 }) => {
  if (!token) {
    throw new AppError("Token is required", 401);
  }

  const dummy = new userModel();
  const decodedToken = await dummy.jwtVerify(token);
  if (!decodedToken || !decodedToken.userId) {
    throw new AppError("Invalid or expired token", 401);
  }

  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 8, 1), 50);
  const skip = Math.max(parseInt(offset, 10) || 0, 0);

  const allUserLinks = await linkModel.find(
    { owner: decodedToken.userId },
    { clicks: 1 }
  );
  const total = allUserLinks.length;
  const totalClicks = allUserLinks.reduce((acc, l) => acc + (l.clicks || 0), 0);

  const links = await linkModel
    .find({ owner: decodedToken.userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit);

  return {
    links: links || [],
    total,
    totalClicks,
    offset: skip,
    limit: parsedLimit,
    hasMore: skip + (links?.length || 0) < total,
  };
};

export const deleteLinkFunction = async ({ redirectKey, token }) => {
  if (!redirectKey || !token) {
    throw new AppError("Link identifier and token are required", 400);
  }

  const dummy = new userModel();
  const decodedToken = await dummy.jwtVerify(token);
  if (!decodedToken || !decodedToken.userId) {
    throw new AppError("Invalid or expired token", 401);
  }

  const deleted = await linkModel.findOneAndDelete({
    redirectKey,
    owner: decodedToken.userId,
  });

  if (!deleted) {
    throw new AppError("Link not found or unauthorized to delete", 404);
  }

  return deleted;
};
