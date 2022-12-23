import { Router } from "express";

import { getUser, getRanking } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/users/:id", authMiddleware, getUser);
userRouter.get("/ranking", getRanking);

export default userRouter;
