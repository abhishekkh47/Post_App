import { Router } from "express";

export const defaultRoutes = Router();

defaultRoutes.get("/", (req, res) => {
  res.send("Welcome to this world");
});
