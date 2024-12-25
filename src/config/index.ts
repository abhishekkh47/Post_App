export default {
  get PORT() {
    return process.env.PORT;
  },
  get DB_PATH() {
    return process.env.DB_PATH;
  },
  get JWT_KEY() {
    return process.env.JWT_KEY || "this_is_a_secret_key";
  },
};
