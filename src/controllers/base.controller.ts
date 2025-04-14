import { Response } from "express";

class BaseController {
  protected Ok<T>(res: Response, data: T) {
    res.status(200).json({ status: 200, data });
  }

  protected BadRequest<T>(res: Response, message: T) {
    res.status(400).json({ status: 400, message: message || "Bad Request" });
  }

  protected UnAuthorized<T>(res: Response, message: T) {
    res.status(401).json({ status: 401, message: message || "Unuthorized" });
  }

  protected InternalServerError<T>(res: Response, message: T) {
    res
      .status(500)
      .json({ status: 500, message: message || "Internal Server Error" });
  }

  protected UnderMaintenance<T>(res: Response, message: T) {
    res.status(503).json({
      status: "maintenance",
      message: message || "Service under maintenance. Please try again later",
    });
  }
}

export default BaseController;
