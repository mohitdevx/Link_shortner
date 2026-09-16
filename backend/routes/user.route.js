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

// Auth and user routes
userRouter.post("/register", registerValidator, userRegister);
userRouter.post("/login", loginValidator, userLogin);
userRouter.get("/me", getCurrentUser);
userRouter.get("/profile", getProfile);

// Link routes
userRouter.post("/v1/newurl", urlValidator, urlValidation);
userRouter.post("/v1/claim", claimUrlController);
userRouter.get("/v1/:redirectKey", redirectUrlController);
userRouter.delete("/v1/:redirectKey", deleteUrlController);
userRouter.get("/:redirectKey", redirectUrlController);
