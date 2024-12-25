"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const base_controller_1 = __importDefault(
  require("controllers/base.controller")
);
const utils_1 = require("utils");
class AuthMiddleware extends base_controller_1.default {
  constructor() {
    super(...arguments);
    this.Auth = (req, res, next) => {
      try {
        const token = req.headers["authorization"];
        if (!token) {
          return this.UnAuthorized(res, "Unauthorized: No token provided");
        }
        const response = (0, utils_1.verifyToken)(token);
        if (response && response.status && response.status == 401) {
          return this.UnAuthorized(res, "Invalid Token");
        }
        req._id = response._id;
        next();
      } catch (error) {
        return this.UnAuthorized(res, "Invalid Token");
      }
    };
  }
}
exports.default = new AuthMiddleware();
//# sourceMappingURL=auth.middleware.js.map
