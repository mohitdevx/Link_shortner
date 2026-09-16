import Redis from "ioredis";

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = parseInt(process.env.REDIS_PORT || "6379", 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

let redisClient = null;
let isRedisConnected = false;

const createRedisInstance = (opts) => {
  const client = new Redis({
    ...opts,
    maxRetriesPerRequest: 2,
    retryStrategy(times) {
      if (times > 10) {
        return null;
      }
      return Math.min(times * 200, 2000);
    },
  });

  client.on("connect", () => {
    isRedisConnected = true;
    console.log(`[Redis] Connected to redis://${opts.host}:${opts.port}`);
  });

  client.on("ready", () => {
    isRedisConnected = true;
  });

  client.on("error", (err) => {
    isRedisConnected = false;
    // If Redis server rejects password because no password was configured
    if (
      err.message &&
      err.message.includes("without any password configured") &&
      opts.password
    ) {
      console.log("[Redis] Retrying connection without password auth...");
      delete opts.password;
      client.disconnect();
      redisClient = createRedisInstance(opts);
      return;
    }
    console.warn("[Redis] Warning:", err.message);
  });

  client.on("close", () => {
    isRedisConnected = false;
  });

  return client;
};

try {
  const opts = {
    host: redisHost,
    port: redisPort,
  };
  if (redisPassword) {
    opts.password = redisPassword;
  }
  redisClient = createRedisInstance(opts);
} catch (err) {
  console.warn("[Redis] Failed to initialize client:", err.message);
}

export const getCache = async (key) => {
  if (!redisClient || !isRedisConnected) return null;
  try {
    return await redisClient.get(key);
  } catch (err) {
    console.warn(`[Redis] Error getting key ${key}:`, err.message);
    return null;
  }
};

export const setCache = async (key, value, ttlSeconds = 86400) => {
  if (!redisClient || !isRedisConnected) return false;
  try {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      await redisClient.set(key, stringValue, "EX", ttlSeconds);
    } else {
      await redisClient.set(key, stringValue);
    }
    return true;
  } catch (err) {
    console.warn(`[Redis] Error setting key ${key}:`, err.message);
    return false;
  }
};

export const delCache = async (key) => {
  if (!redisClient || !isRedisConnected) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (err) {
    console.warn(`[Redis] Error deleting key ${key}:`, err.message);
    return false;
  }
};

export const incrCache = async (key) => {
  if (!redisClient || !isRedisConnected) return null;
  try {
    return await redisClient.incr(key);
  } catch (err) {
    console.warn(`[Redis] Error incrementing key ${key}:`, err.message);
    return null;
  }
};

export const getCacheTtl = async (key) => {
  if (!redisClient || !isRedisConnected) return -1;
  try {
    return await redisClient.ttl(key);
  } catch {
    return -1;
  }
};

export const getRedisHealth = () => ({
  connected: isRedisConnected,
  host: redisHost,
  port: redisPort,
});

export { redisClient, isRedisConnected };
