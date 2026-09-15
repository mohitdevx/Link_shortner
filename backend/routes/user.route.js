import { Router } from "express";
import {
  loginValidator,
  registerValidator,
  urlValidator,
} from "../middleware/req.validation.js";
import {
  urlValidation,
  userLogin,
  userRegister,
  redirectUrlController,
  getProfile,
  getCurrentUser,
  deleteUrlController,
  claimUrlController,
} from "../controllers/user.control.js";

export const userRouter = Router();

// Auth routes
userRouter.post("/register", registerValidator, userRegister);
userRouter.post("/login", loginValidator, userLogin);
userRouter.get("/me", getCurrentUser);

// Link routes
userRouter.post("/v1/newurl", urlValidator, urlValidation);
userRouter.post("/v1/claim", claimUrlController);
userRouter.get("/v1/:redirectKey", redirectUrlController);
userRouter.get("/:redirectKey", redirectUrlController);
userRouter.delete("/v1/:redirectKey", deleteUrlController);
userRouter.get("/profile", getProfile);
