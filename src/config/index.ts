export default {
  get PORT() {
    return process.env.PORT;
  },
  get DB_PATH() {
    return process.env.DB_PATH;
  },
  get JWT_KEY() {
    return process.env.JWT_KEY ?? "this_is_a_secret_key";
  },
  get BASEURL() {
    return process.env.BASEURL;
  },
  get ADMIN_EMAIL() {
    return process.env.ADMIN_EMAIL;
  },
  get ADMIN_PASSWORD() {
    return process.env.ADMIN_PASSWORD;
  },
  get MAILGUN_API_KEY() {
    return process.env.MAILGUN_API_KEY;
  },
  get NODE_ENV() {
    return process.env.NODE_ENV;
  },
  get UPLOADS_DIR() {
    return process.env.UPLOADS_DIR;
  },
  get CACHING() {
    return process.env.CACHING;
  },
  get REDIS_HOST() {
    return process.env.REDIS_HOST;
  },
  get REDIS_USERNAME() {
    return process.env.REDIS_USERNAME;
  },
  get REDIS_PASSWORD() {
    return process.env.REDIS_PASSWORD;
  },
  get CLOUDINARY_CLOUD_NAME() {
    return process.env.CLOUDINARY_CLOUD_NAME;
  },
  get CLOUDINARY_API_KEY() {
    return process.env.CLOUDINARY_API_KEY;
  },
  get CLOUDINARY_API_SECRET() {
    return process.env.CLOUDINARY_API_SECRET;
  },
  get CLOUDINARY_API_ENV() {
    return process.env.CLOUDINARY_API_ENV;
  },
  get MAINTENANCE_MODE() {
    return process.env.MAINTENANCE_MODE;
  },
};
