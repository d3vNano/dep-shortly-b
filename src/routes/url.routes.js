import { Router } from "express";

import { insertShorten, openShorten } from "../controllers/url.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const urlRouter = Router();

urlRouter.post("/urls/shorten", authMiddleware, insertShorten);
urlRouter.get("/urls/open/:shortUrl", openShorten);

export default urlRouter;
