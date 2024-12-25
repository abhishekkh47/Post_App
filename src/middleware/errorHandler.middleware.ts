import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.name === "NetworkError") {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }

  console.error(err); // Log unexpected errors for debugging
  return res.status(500).json({ message: "Internal Server Error" });
};

export class NetworkError extends Error {
  status: number;
  constructor(message: any, status: number) {
    super(message);
    this.status = status;
  }
}
