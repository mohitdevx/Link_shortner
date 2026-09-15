import { validationResult } from "express-validator";
import {
  registerFunction,
  loginFunction,
  validateUrl,
  redirectFunction,
  userFunction,
} from "../services/user.service.js";
import { application } from "express";
import { userRouter } from "../routes/user.route.js";

export const userRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    res.status(400).send(errors.array());
  }

  const { username, fullName, password } = req.body;

  await registerFunction({ username, fullName, password })
    .then((user) => {
      res.status(201).json({
        message: "User registered successfully",
        success: true,
        user: {
          username: user.username,
          fullName: user.fullName,
          createdAt: user.createdAt,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        message: err.message,
        success: false,
      });
    });
};

export const userLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    res.status(400).send(errors.array());
  }

  const { username, password } = req.body;

  await loginFunction({ username, password })
    .then((user) => {
      res.status(200).json({
        message: "User login successfully",
        success: true,
        user: {
          username: user.user.username,
          fullName: user.user.fullName,
          createdAt: user.user.createdAt,
        },
        token: user.token,
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        message: err.message,
        success: false,
      });
    });
};

export const urlValidation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    res.status(400).send(errors.array());
  }

  const { url, token } = req.body;
  await validateUrl({ url, token })
    .then((url) => {
      res.status(200).json({
        message: "URL generated successful",
        success: true,
        url: `http://localhost:5000/api/v1/${url.redirectKey}`,
        status: url.status,
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        message: err.message,
        success: false,
      });
    });
};

export const redirectUrlController = async (req, res) => {
  const { redirectKey } = req.params;

  if (!redirectKey) {
    return res
      .status(400)
      .send({ message: "Redirect key is required", success: false });
  }

  await redirectFunction({ redirectKey })
    .then((url) => {
      res.redirect(url);
    })
    .catch((err) => {
      console.log(err);
      res.send({
        message: err.message,
        success: false,
      });
    });
};

export const getProfile = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res
      .status(401)
      .send({ message: "Token is required", success: false });
  }

  await userFunction({ token })
    .then((user) => {
      res.send({
        message: "Profile fetched successfully",
        success: true,
        data: user.map((link) => {
          return {
            originalUrl: link.originalUrl,
            shortUrl: `http://localhost:5000/api/v1/${link.redirectKey}`,
            createdAt: link.createdAt,
            clicks: link.clicks,
          };
        }),
      });
    })
    .catch((err) => {
      console.error(err);
      res.send({
        message: err.message,
        success: false,
      });
    });
};
