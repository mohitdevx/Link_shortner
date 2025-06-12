import { nanoid } from "nanoid";
import { linkModel } from "../model/link.schema.js";
import { userModel } from "../model/user.schema.js";
import { AppError } from "../utils/global.error.js";

export const registerFunction = async ({ username, fullName, password }) => {
  if (!username || !fullName || !password) {
    throw new AppError("all fields are required");
  }

  const user = await userModel.create({
    username,
    fullName,
    password,
  });

  if (!user) {
    throw new AppError("failed to create user");
  }

  return user;
};

export const loginFunction = async ({ username, password }) => {
  if (!username || !password) {
    throw new AppError("all fields are required");
  }

  const user = await userModel.findOne({ username });

  if (!user) {
    throw new AppError("User not found");
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new AppError("Invalid password");
  }

  const token = await user.generateToken();
  return { token, user };
};

export const validateUrl = async ({ url, token }) => {
  if (!url || !token) {
    throw new AppError("all fields are required");
  }

  const dummy = new userModel();
  const decodedToken = await dummy.jwtVerify(token);

  if (!decodedToken) {
    throw new AppError("Invalid token");
  }

  const Url = await linkModel.create({
    originalUrl: url,
    owner: decodedToken.userId,
    redirectKey: nanoid(7),
  });

  if (!Url) {
    throw new AppError("failed to create url");
  }

  return Url;
};

export const redirectFunction = async ({ redirectKey }) => {
  if (!redirectKey) {
    throw new AppError("Redirect key is required");
  }

  const Url = await linkModel.findOneAndUpdate(
    { redirectKey }, // query
    { $inc: { clicks: 1 } }, // update: increment 'clicks' by 1
    { new: true } // return the updated document
  );

  if (!Url) {
    throw new AppError("Invalid redirect key");
  }

  return Url.originalUrl;
};

// userFunction.js
export const userFunction = async ({ token }) => {
  if (!token) {
    throw new AppError("Token is required");
  }

  const dummy = new userModel();
  const decodedToken = await dummy.jwtVerify(token);
  if (!decodedToken) {
    throw new AppError("Invalid token");
  }

  const Links = await linkModel.find({ owner: decodedToken.userId });

  if (!Links) {
    throw new AppError("No links found for the user");
  }
  return Links;
};
