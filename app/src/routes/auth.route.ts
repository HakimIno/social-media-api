import { Hono } from "hono";
import { Environment } from "../../../bindings";
import * as authController from "../controllers/auth/auth.controller";

export const route = new Hono<Environment>();

const twoMinutes = 120;
const oneRequest = 1;

route.post("/register", authController.register);
route.post("/login", authController.login);
