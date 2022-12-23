import { Router } from "express";

import {
    insertShorten,
    getShorten,
    openShorten,
    deleteShorten,
} from "../controllers/url.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const urlRouter = Router();

urlRouter.post("/urls/shorten", authMiddleware, insertShorten);
urlRouter.get("/urls/:id", getShorten);
urlRouter.get("/urls/open/:shortUrl", openShorten);
urlRouter.delete("/urls/:id", authMiddleware, deleteShorten);

export default urlRouter;
