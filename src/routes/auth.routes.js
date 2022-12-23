import { Router } from "express";

import { signUp, signIn } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);

export default authRouter;
