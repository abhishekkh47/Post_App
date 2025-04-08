import redis from "ioredis";

export const CACHING = {
  ENABLED: "enabled",
  DISABLED: "disabled",
};

export const REDIS_KEYS = {
  GET_FRIENDS: "getFriends",
  GET_MY_FEED: "getMyFeed",
  GET_NOTIFICATIONS: "getNotifications",
  GET_CONVERSATIONS: "getConversations",
  GET_POST_COMMENTS: "getCommentsByPostId",
  GET_COMMENTS_BY_USER: "getCommentsByUserId",
  GET_ALL_USERS: "getAllUsers",
  GET_USER_PROFILE: "getUserProfile",
};

export const redisClient = new redis({
  host: "localhost", // e.g. 'localhost' or an IP address
  port: 6379,
  maxRetriesPerRequest: 5,
});

redisClient
  .ping()
  .then((result) => {
    console.log("Connection successful:", result); // Should log 'PONG'
  })
  .catch((err) => {
    console.error("Error connecting to Redis:", err);
  });

export const getDataFromCache = async (key: string) => {
  try {
    if (!isRedisAvailable()) return null;
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      return cachedData;
    }
  } catch (error) {
    console.log("redis error > ", error);
    return null;
  }
};

export const setDataToCache = async (
  key: string,
  value: string,
  ttl: number = 60
) => {
  try {
    if (!isRedisAvailable()) return null;
    await redisClient.set(key, value, "EX", ttl); // 1 min
  } catch (error) {
    console.log("redis error > ", error);
    return null;
  }
};

export const removeDataFromCache = async (key: string) => {
  try {
    if (!isRedisAvailable()) return null;
    await redisClient.del(key);
  } catch (error) {
    console.log("redis error > ", error);
    return null;
  }
};

// Function to check if Redis is available
async function isRedisAvailable() {
  try {
    // Create a race between ping and a timeout to ensure no retries
    const pingPromise = redisClient.ping();
    const timeoutPromise = new Promise(
      (resolve, reject) =>
        setTimeout(
          () => reject(new Error("Timeout: Redis is not available")),
          1000
        ) // Timeout after 1 seconds
    );

    // Return the result of the ping if Redis is available, or reject if there's a timeout
    const response = await Promise.race([pingPromise, timeoutPromise]);
    return response === "PONG"; // If Redis responds with PONG, it's available
  } catch (error) {
    console.error("Redis is unavailable:", error);
    return false; // Return false if Redis is unavailable or times out
  }
}
