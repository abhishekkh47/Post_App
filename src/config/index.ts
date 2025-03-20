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
};
