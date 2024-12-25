import { Request } from "express";

declare global {
  namespace Express {
    export interface Request {
      _id?: string; // You can specify any additional fields here
    }
  }
}
