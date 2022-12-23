import { Router } from "express";

import { insertShorten } from "../controllers/url.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const urlRouter = Router();

urlRouter.post("/urls/shorten", authMiddleware, insertShorten);

export default urlRouter;
