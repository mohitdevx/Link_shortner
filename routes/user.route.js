import { Router } from "express";
import { loginValidator, registerValidator, urlValidator } from "../middleware/req.validation.js";
import { urlValidation, userLogin, userRegister, redirectUrlController, getProfile } from "../controllers/user.control.js";

export const userRouter = Router();

userRouter.post("/register", registerValidator, userRegister);
userRouter.post("/login", loginValidator, userLogin);
userRouter.post("/v1/newurl", urlValidator, urlValidation);
userRouter.get("/v1/:redirectKey", redirectUrlController);
userRouter.get("/profile", getProfile);

