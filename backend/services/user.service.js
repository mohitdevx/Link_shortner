import { nanoid } from "nanoid";
import QRCode from "qrcode";
import { linkModel } from "../model/link.schema.js";
import { userModel } from "../model/user.schema.js";
import { AppError } from "../utils/global.error.js";
import {
  getCache,
  setCache,
  delCache,
  getCacheTtl,
  incrCache,
} from "../config/redis.js";

export const registerFunction = async ({
  username,
  email,
  fullName,
  password,
}) => {
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

export const loginFunction = async ({
  identifier,
  username,
  email,
  password,
}) => {
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

  // Prime Redis Cache (24h TTL)
  setCache(`link:${shortLink.redirectKey}`, shortLink.originalUrl, 86400).catch(
    (err) => console.warn("[Redis] Failed to cache new link:", err.message)
  );

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

  if (link) {
    delCache(`inspect:${redirectKey}`).catch(() => {});
  }

  return link;
};

export const redirectFunction = async ({ redirectKey }) => {
  if (!redirectKey) {
    throw new AppError("Redirect key is required", 400);
  }

  // 1. Check Redis Cache for sub-millisecond response
  const cachedOriginalUrl = await getCache(`link:${redirectKey}`);
  if (cachedOriginalUrl) {
    // Increment clicks in Redis instantly
    incrCache(`clicks:${redirectKey}`).catch(() => {});

    // Asynchronously update clicks in MongoDB
    linkModel
      .updateOne({ redirectKey }, { $inc: { clicks: 1 } })
      .exec()
      .catch((err) =>
        console.warn("[DB] Background click update error:", err.message)
      );

    // Evict inspect cache so analytics stay fresh
    delCache(`inspect:${redirectKey}`).catch(() => {});

    return cachedOriginalUrl;
  }

  // 2. Cache Miss -> Query MongoDB & increment click counter
  const link = await linkModel.findOneAndUpdate(
    { redirectKey },
    { $inc: { clicks: 1 } },
    { new: true }
  );

  if (!link) {
    throw new AppError("Short link not found", 404);
  }

  // 3. Store in Redis Cache (24h TTL) & sync clicks
  setCache(`link:${redirectKey}`, link.originalUrl, 86400).catch(() => {});
  setCache(`clicks:${redirectKey}`, link.clicks, 86400).catch(() => {});

  return link.originalUrl;
};

export const getLinkClicksFunction = async ({ redirectKey }) => {
  if (!redirectKey) {
    throw new AppError("Redirect key is required", 400);
  }

  // Light request: Query Redis first (zero DB lag)
  const cachedClicks = await getCache(`clicks:${redirectKey}`);
  if (cachedClicks !== null && cachedClicks !== undefined) {
    return {
      redirectKey,
      clicks: parseInt(cachedClicks, 10) || 0,
      source: "redis",
    };
  }

  // Fallback: Query MongoDB
  const link = await linkModel.findOne({ redirectKey }, { clicks: 1 });
  if (!link) {
    throw new AppError("Short link not found", 404);
  }

  const clicks = link.clicks || 0;
  // Populate Redis cache
  setCache(`clicks:${redirectKey}`, clicks, 86400).catch(() => {});

  return {
    redirectKey,
    clicks,
    source: "db",
  };
};

export const inspectLinkFunction = async ({ redirectKey, token, baseUrl }) => {
  if (!redirectKey) {
    throw new AppError("Redirect key is required", 400);
  }

  // Check Redis cache status & TTL
  const cachedUrl = await getCache(`link:${redirectKey}`);
  const cacheTtl = await getCacheTtl(`link:${redirectKey}`);

  // Fetch link record from DB
  const link = await linkModel
    .findOne({ redirectKey })
    .populate("owner", "username email fullName");

  if (!link) {
    throw new AppError("Short link not found", 404);
  }

  // If not currently in cache, prime it now
  if (!cachedUrl) {
    setCache(`link:${redirectKey}`, link.originalUrl, 86400).catch(() => {});
  }

  // Check user ownership if authenticated
  let isOwner = false;
  if (token) {
    try {
      const dummy = new userModel();
      const decodedToken = await dummy.jwtVerify(token);
      if (
        decodedToken?.userId &&
        link.owner &&
        String(link.owner._id || link.owner) === String(decodedToken.userId)
      ) {
        isOwner = true;
      }
    } catch {
      // ignore
    }
  }

  // Parse destination URL for deep intelligence
  let domain = "";
  let protocol = "https:";
  let pathname = "/";
  let paramsCount = 0;
  try {
    const parsed = new URL(link.originalUrl);
    domain = parsed.hostname;
    protocol = parsed.protocol;
    pathname = parsed.pathname;
    paramsCount = Array.from(parsed.searchParams.keys()).length;
  } catch {
    domain = link.originalUrl;
  }

  const shortUrl = `${baseUrl}/api/v1/${link.redirectKey}`;

  // Generate QR Code data URL
  let qrCode = "";
  try {
    qrCode = await QRCode.toDataURL(shortUrl, {
      margin: 2,
      width: 280,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.warn("[QRCode] Failed to generate QR code:", err.message);
  }

  return {
    redirectKey: link.redirectKey,
    shortUrl,
    originalUrl: link.originalUrl,
    clicks: link.clicks || 0,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
    isSaved: Boolean(link.owner),
    isOwner,
    owner: link.owner
      ? {
          username: link.owner.username,
          fullName: link.owner.fullName,
        }
      : null,
    qrCode,
    analysis: {
      domain,
      protocol: protocol.replace(":", ""),
      isSecure: protocol === "https:",
      pathname,
      paramsCount,
      safetyBadge:
        protocol === "https:" ? "Secure (TLS/HTTPS)" : "Unencrypted (HTTP)",
    },
    cache: {
      isCached: Boolean(cachedUrl),
      ttlSeconds: cacheTtl > 0 ? cacheTtl : 86400,
      engine: "Redis",
      status: cachedUrl
        ? "Cache HIT (Sub-millisecond memory cached)"
        : "Cache MISS (Warmed into Redis memory)",
    },
  };
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

  // Evict from Redis Cache
  delCache(`link:${redirectKey}`).catch(() => {});
  delCache(`inspect:${redirectKey}`).catch(() => {});
  delCache(`clicks:${redirectKey}`).catch(() => {});

  return deleted;
};
