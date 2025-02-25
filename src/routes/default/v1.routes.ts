import { Router } from "express";

const defaultRoutes = Router();

defaultRoutes.get("/", (req, res) => {
  res.send("Welcome to this world");
});

export default defaultRoutes;
