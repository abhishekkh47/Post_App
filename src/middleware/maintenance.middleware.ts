import { Request, Response, NextFunction } from "express";
import Config from "../config";

export const maintenanceModeHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (Config.MAINTENANCE_MODE === "true") {
    return res
      .status(503)
      .json({ status: "maintenance", message: "Service in maintenance mode" });
  }
  return res.json();
};
